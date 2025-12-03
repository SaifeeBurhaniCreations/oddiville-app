import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormValidator } from "@/lib/custom_library/formValidator/useFormValidator"; 

import { LoginService } from "@/services/AuthService";
import Spinner from "@/components/Spinner/Spinner";

const Signin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState("");

  const form = useFormValidator(
    { email: "", userpass: "" },
    {
      email: [
        { type: "required", message: "Email is required" },
        { type: "email", message: "Invalid email format" },
      ],
      userpass: [
        { type: "required", message: "Password is required" },
        {
          type: "minLength",
          length: 1,
          message: "Password must be at least 8 characters",
        },
      ],
    },
    { validateOnChange: true, debounce: 300 }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const result = form.validateForm();

    if (result.success) {
      setIsLoading(true);

      const loginData = {
        ...result.data,
        rememberMe: rememberMe,
      };

      try {
        const response = await LoginService(loginData);

        if (response.status === 200) {
          localStorage.setItem("metadata", response.token);
          navigate("/");
        } else {
          const errorMessage =
            response.message ||
            "Login failed. Please check your email and password.";
          setApiError(errorMessage);
        }
      } catch (error) {
        console.error("Login Error:", error);
        setApiError("An unexpected error occurred. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="main-content mt-0">
      <section>
        <div className="page-header min-vh-100">
          <div className="container">
            <div className="row">
              <div className="col-xl-4 col-lg-5 col-md-6 d-flex flex-column mx-auto">
                <div className="card card-plain mt-8">
                  <div className="card-header pb-0 text-left bg-transparent">
                    <h3 className="font-weight-bolder text-info text-gradient">
                      Welcome to Oddiville
                    </h3>
                    <p className="mb-0">
                      Enter your email and password to sign in
                    </p>
                  </div>
                  <div className="card-body">
                    {apiError && (
                      <div className="text-danger text-center mb-3">
                        {apiError}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} role="form">
                      <label>Email</label>
                      <div className="mb-3">
                        <input
                          type="email"
                          value={form.values.email}
                          onChange={(e) =>
                            form.setField("email", e.target.value)
                          }
                          placeholder="Email"
                          className="form-control"
                        />
                        {form.errors.email && (
                          <div className="text-danger text-sm">
                            {form.errors.email}
                          </div>
                        )}
                      </div>

                      <label>Password</label>
                      <div className="mb-3">
                        <input
                          type="password"
                          value={form.values.userpass}
                          onChange={(e) =>
                            form.setField("userpass", e.target.value)
                          }
                          placeholder="Password"
                          className="form-control"
                        />
                        {form.errors.userpass && (
                          <div className="text-danger text-sm">
                            {form.errors.userpass}
                          </div>
                        )}
                      </div>

                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="rememberMe"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="rememberMe"
                        >
                          Remember me
                        </label>
                      </div>

                      <div className="text-center">
                        <button
                          type="submit"
                          className="btn bg-gradient-info w-100 mt-4 mb-0"
                          disabled={!form.isValid || isLoading}
                        >
                          Sign in {isLoading && <Spinner />}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="oblique position-absolute top-0 h-100 d-md-block d-none me-n8">
                  <div
                    className="oblique-image bg-cover position-absolute fixed-top ms-auto h-100 z-index-0 ms-n6"
                    style={{
                      backgroundImage: 'url("../assets/img/png/factory.png")',
                      backgroundSize: "cover",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Signin;
