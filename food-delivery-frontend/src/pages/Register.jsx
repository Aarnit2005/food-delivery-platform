import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User
} from "lucide-react";

import "./Register.css";

const API_URL = "http://localhost:8082";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password
    ) {
      setError(
        "Please fill in all the fields."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password: password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to create your account."
        );
      }

      /*
       * Store the newly created user's information.
       * This allows the rest of the FoodRush
       * application to use the correct user ID.
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

      navigate("/");

    } catch (err) {
      setError(
        err.message ||
        "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* LEFT PANEL */}

      <section className="register-visual">

        <Link
          to="/"
          className="register-brand"
        >
          <span className="register-brand-mark">
            F
          </span>

          FoodRush
        </Link>

        <div className="register-visual-content">

          <div className="register-food-icon">
            🍔
          </div>

          <span className="register-visual-eyebrow">
            JOIN FOODRUSH
          </span>

          <h1>
            Great food is
            <br />
            better together.
          </h1>

          <p>
            Create your FoodRush account and
            discover delicious meals from your
            favourite restaurants.
          </p>

          <div className="register-benefits">

            <div>
              <span>✓</span>
              <p>Browse local restaurants</p>
            </div>

            <div>
              <span>✓</span>
              <p>Save your favourite orders</p>
            </div>

            <div>
              <span>✓</span>
              <p>Track deliveries in real time</p>
            </div>

          </div>

        </div>

        <div className="register-visual-footer">
          © 2026 FoodRush
        </div>

      </section>

      {/* RIGHT PANEL */}

      <section className="register-form-section">

        <Link
          to="/"
          className="register-back"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="register-form-container">

          <div className="register-form-header">

            <div className="register-mobile-logo">
              <span>F</span>
              FoodRush
            </div>

            <span className="register-eyebrow">
              CREATE ACCOUNT
            </span>

            <h2>
              Welcome to FoodRush
            </h2>

            <p>
              Create your account and start
              ordering your favourite food.
            </p>

          </div>

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="register-field">

              <label htmlFor="name">
                Full name
              </label>

              <div className="register-input-wrapper">

                <User size={17} />

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  autoComplete="name"
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="register-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="register-input-wrapper">

                <Mail size={17} />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  autoComplete="email"
                />

              </div>

            </div>

            {/* PHONE */}

            <div className="register-field">

              <label htmlFor="phone">
                Phone number
              </label>

              <div className="register-input-wrapper">

                <Phone size={17} />

                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  autoComplete="tel"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="register-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="register-input-wrapper">

                <LockKeyhole size={17} />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
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

              <span className="password-hint">
                Use at least 6 characters.
              </span>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}

              {!loading && (
                <span>→</span>
              )}
            </button>

          </form>

          <div className="register-divider">
            <span>OR</span>
          </div>

          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
            </Link>

          </div>

          <div className="register-security">

            <ShieldCheck size={15} />

            <span>
              Your password is securely protected
              using encrypted authentication.
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Register;