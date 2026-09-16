import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck
} from "lucide-react";

import "./Login.css";

const API_URL = "http://localhost:8082";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Invalid email or password."
        );
      }

      /*
       * The backend returns the logged-in user.
       * We store the user ID so the cart,
       * checkout and orders can use it.
       */

      if (data.id) {
        localStorage.setItem(
          "foodrushUserId",
          String(data.id)
        );
      }

      if (data.email) {
        localStorage.setItem(
          "foodrushUserEmail",
          data.email
        );
      }

      if (data.name) {
        localStorage.setItem(
          "foodrushUserName",
          data.name
        );
      }

      const redirectPath =
        location.state?.from || "/";

      navigate(redirectPath);

    } catch (err) {
      setError(
        err.message ||
        "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT PANEL */}

      <section className="login-visual">

        <Link
          to="/"
          className="login-brand"
        >
          <span className="login-brand-mark">
            F
          </span>

          FoodRush
        </Link>

        <div className="login-visual-content">

          <div className="login-food-icon">
            🍛
          </div>

          <span className="login-visual-eyebrow">
            GOOD FOOD. GOOD MOOD.
          </span>

          <h1>
            Your favourite food,
            <br />
            just a few clicks away.
          </h1>

          <p>
            Discover great restaurants, order
            delicious meals and get them delivered
            straight to your doorstep.
          </p>

          <div className="login-benefits">

            <div>
              <span>✓</span>
              <p>Curated restaurants</p>
            </div>

            <div>
              <span>✓</span>
              <p>Fast doorstep delivery</p>
            </div>

            <div>
              <span>✓</span>
              <p>Secure payments</p>
            </div>

          </div>

        </div>

        <div className="login-visual-footer">
          © 2026 FoodRush
        </div>

      </section>

      {/* RIGHT PANEL */}

      <section className="login-form-section">

        <Link
          to="/"
          className="login-back"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="login-form-container">

          <div className="login-form-header">

            <div className="login-mobile-logo">
              <span>F</span>
              FoodRush
            </div>

            <span className="login-eyebrow">
              WELCOME BACK
            </span>

            <h2>
              Login to FoodRush
            </h2>

            <p>
              Sign in to continue ordering your
              favourite food.
            </p>

          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="login-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="login-input-wrapper">

                <Mail size={17} />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="login-field">

              <div className="password-label-row">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    setError(
                      "Password reset is not available in this MVP."
                    )
                  }
                >
                  Forgot password?
                </button>

              </div>

              <div className="login-input-wrapper">

                <LockKeyhole size={17} />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>

            {/* LOGIN */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}

              {!loading && (
                <span>→</span>
              )}
            </button>

          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <div className="login-register">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create one
            </Link>

          </div>

          <div className="login-security">

            <ShieldCheck size={15} />

            <span>
              Your account information is protected
              with secure authentication.
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;