require("dotenv").config();
const router = require("express").Router();
const { Admin: adminClient } = require("../models");
const jwt = require("jsonwebtoken");
const { validatePassword, hashPassword } = require("../utils/auth");
const userSchema = require("../schemas/userSchema");
const { sendUserCreatedNotification } = require("../utils/notification");
const { Op } = require("sequelize");
router.get("/users", async (req, res) => {
  const response_signup_find = await adminClient.findAll();

  return res.status(200).json(response_signup_find);
});

// router.post("/authentication/signup", async (req, res) => {
//   console.log("req.body", req.body);

//   if (!req.body.username) {
//     return res.status(400).json({ error: "Username is required." });
//   }

//   req.body.userpass = req.body.username;
//   const signupUser = req.body;

//   try {
//     const response_signup_create = await adminClient.create(signupUser);
//     const user = response_signup_create.dataValues;

//     if (!process.env.JWT_SECRET) {
//       console.error("JWT_SECRET is not defined in environment variables.");
//       return res.status(500).json({ error: "Server configuration error." });
//     }

//     const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
//     return res.status(200).json({ token });
//   } catch (error) {
//     console.error("Error during authentication:", error);
//     return res.status(500).json({ error: "Internal server error." });
//   }
// });

router.post("/authentication/login", async (req, res) => {
  let { email, userpass } = req.body;

  if (!email || !userpass) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const response_login_find = await adminClient.findOne({ where: { email } });
console.log("response_login_find", response_login_find);

    if (!response_login_find) {
      return res.status(401).json({ error: "Email or password is not valid." });
    }

    const admin = response_login_find.dataValues;

    const passwordMatch = await validatePassword(userpass, admin.userpass);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Username or password is not valid." });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT_SECRET not configured." });
    }

    const token = jwt.sign({ email: admin.email }, process.env.JWT_SECRET);

    const authData = {
      username: admin.username,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      profilepic: admin.profilepic,
      role: admin.role,
      policies: admin.policies || [], 
    };

    return res.status(200).json({ token, authData });

  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  console.log("authHeader", authHeader);
  
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization token is missing." });
  }
  const token = authHeader.split(" ")[1].trim();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const response_signup_find = await adminClient.findOne({
      where: { email },
    });

    return res.status(200).json(response_signup_find);
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
});

router.post("/authentication/signup", async (req, res) => {
    const signupUser = {
        username: "admin",
        userpass: await hashPassword("1"),
        name: "Root Admin",
        role: "superadmin",
        email: "admin@oddiville.com",
        phone: "1234567890",
        policies: null,
        profilepic: "https://5ce38766bf86.ngrok-free.app/profilepic/K7b1A9xGmEwZ3uYJqPTFhV20cdNsXoQnMBiRKe5L8tzrCJHgWvUpafSODl9y6Bk4EN.png",
        createdAt: Date.now(),
        updatedAt: Date.now(),
    }
    // const signupUser = {
    //     username: "supervisor.oddiville",
    //     userpass: await hashPassword("1"),
    //     name: "Anand Mehta",
    //     role: "supervisor",
    //     email: "manager@oddiville.com",
    //     phone: "+919876543210",
    //     profilepic: "https://9714-2402-8100-2731-9da3-b876-7c59-bc39-c713.ngrok-free.app/profilepic/lokqkDWgwjg$oQFFOgrigeoho5h95hoofa0fa303kfskkKFJjOJOJSFJAEFJ.png",
    //     createdAt: Date.now(),
    //     updatedAt: Date.now(),
    // }
    try {
        const response_signup_create = await adminClient.create(signupUser);
        const admin = response_signup_create.dataValues;
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables.");
            return res.status(500).json({ error: "Server configuration error." });
        }
        const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET)
        return res.status(200).json({ token });
    } catch (error) {
        console.error("Error during authentication:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.post("/users", async (req, res) => {
  const io = req.app.get("io");
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Authorization token is missing." });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables.");
      return res.status(500).json({ error: "Server configuration error." });
    }

    const token = authHeader.split(" ")[1].trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const authenticatedUser = await adminClient.findOne({
      where: { email: decoded.email },
    });

    if (!authenticatedUser || authenticatedUser.role !== "superadmin") {
      return res
        .status(403)
        .json({ error: "Only superadmins can create new users." });
    }

    // const parsed = userSchema.parse(req.body);
    const parsed = req.body;
    console.log("parsed", parsed);

    const existingUser = await adminClient.findOne({
      where: { username: parsed.username },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newAdmin = await adminClient.create({
      ...parsed,
      userpass: await hashPassword(parsed.username),
      role: parsed.role || "supervisor",
    });

    io.emit("user:created", newAdmin.get({ plain: true }));

    return res.status(201).json({
      message: "Admin user created successfully",
      data: newAdmin,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    }

    console.error("Error adding user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || username.trim() === "") {
      return res.status(400).json({
        error: "Username is required.",
      });
    }

    const user = await adminClient.findOne({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    await adminClient.destroy({
      where: { username },
    });

    return res.status(200).json({
      message: "User deleted successfully.",
      deletedUser: user, 
    });

  } catch (err) {
    console.error("DELETE /user/:username error:", err);

    return res.status(500).json({
      error: "Internal server error. Please try again later.",
      details: err.message,
    });
  }
});

router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || username.trim() === "") {
      return res.status(400).json({
        error: "Username is required.",
      });
    }

    const user = await adminClient.findOne({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    return res.status(200).json({
      message: "User Fetched successfully.",
      user, 
    });

  } catch (err) {
    console.error("get /user/:username error:", err);

    return res.status(500).json({
      error: "Internal server error. Please try again later.",
      details: err.message,
    });
  }
});

router.patch("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    if (!username || username.trim() === "") {
      return res.status(400).json({ error: "Username is required." });
    }

    const user = await adminClient.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const allowed = ["name", "email", "phone", "role", "profilepic"];
    const incoming = req.body || {};
    const updates = {};

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(incoming, key)) {
        updates[key] = incoming[key];
      }
    }

    if (updates.email && typeof updates.email === "string") {
      const email = updates.email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }
      updates.email = email.toLowerCase();
    }

    if (updates.phone && typeof updates.phone === "string") {
      const digits = updates.phone.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        return res.status(400).json({ error: "Invalid phone number." });
      }
      updates.phone = digits;
    }

    if (updates.role && !["admin", "supervisor", "superadmin"].includes(updates.role)) {
      return res.status(400).json({ error: "Invalid role." });
    }

    if (updates.email) {
      const existing = await adminClient.findOne({
        where: {
          email: updates.email,
          username: { [Op.ne]: user.username },
        },
      });
      if (existing) {
        return res.status(409).json({ error: "Email already in use by another user." });
      }
    }

    await user.update(updates);

    const safeUser = user.toJSON ? user.toJSON() : user;
    delete safeUser.userpass;    
    delete safeUser.sensitiveField; 
    return res.status(200).json({
      message: "User updated successfully.",
      user: safeUser,
    });
  } catch (err) {
    console.error("Patch /user/:username error:", err);
    return res.status(500).json({
      error: "Internal server error. Please try again later.",
      details: err.message,
    });
  }
});


module.exports = router;
