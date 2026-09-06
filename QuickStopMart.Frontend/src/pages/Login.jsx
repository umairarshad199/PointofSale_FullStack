import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const navigationEntry = performance.getEntriesByType("navigation")[0];

    if (
      navigationEntry &&
      navigationEntry.type === "back_forward"
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("role");
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setError("Username is required.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/Auth/login", {
        userName: cleanUsername,
        password: password,
      });

      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.userName);
      localStorage.setItem("role", data.role);

      navigate("/");
    } catch (error) {
      if (error.response) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Invalid username or password."
        );
      } else {
        setError(
          "Unable to connect to the server. Make sure the ASP.NET Core API is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-brand">

          <div className="login-brand-icon">
            Q
          </div>

          <div>
            <h1>QuickStop</h1>
            <span>Mart</span>
          </div>

        </div>

        <div className="login-heading">

          <h2>Welcome back</h2>

          <p>
            Sign in to continue to QuickStop Mart
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError("");
              }}
              required
              disabled={loading}
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              required
              disabled={loading}
            />

          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <div className="login-footer">

          <p>
            QuickStop Mart POS System
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;