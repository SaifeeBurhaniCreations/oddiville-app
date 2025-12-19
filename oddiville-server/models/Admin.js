module.exports = (sequelize, Sequelize) => {
  const Admin = sequelize.define(
    "admins",
    {
      username: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      userpass: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true,
          isSpecificDomain(value) {
            const allowedDomains = [
              "gmail.com",
              "hotmail.com",
              "oddiville.com",
            ];
            const emailDomain = value.split("@")[1];
            if (!allowedDomains.includes(emailDomain)) {
              throw new Error(
                `Email domain must be one of: ${allowedDomains.join(", ")}`
              );
            }
          },
        },
      },
      phone: {
        type: Sequelize.STRING,
      },
      profilepic: {
        type: Sequelize.STRING,
      },
      role: {
        type: Sequelize.ENUM("superadmin", "admin", "supervisor"),
        allowNull: false,
        defaultValue: "supervisor",
      },
      policies: {
        type: Sequelize.ARRAY(
          Sequelize.ENUM("purchase-view", "purchase-edit", "production", "package", "sales-view", "sales-edit", "trucks", "labours")
        ),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    { timestamps: true }
  );

  return Admin;
};
