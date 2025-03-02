import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const AdminLogin = ({ onLogin }) => {
  const [loginClick, setLoginClick] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const apiUrl = "https://spam-admin-side-y74w.vercel.app/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginClick(true);
    try {
      const { data } = await axios.post(`${apiUrl}api/login`, credentials);
      if (!data.token) {
        throw new Error("Authentication failed");
      }
      localStorage.setItem("adminToken", data.token);
      onLogin(true);
      toast.success("Logged in successfully");
      navigate("/home");
    } catch (error) {
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server. Please try again.";
      } else {
        errorMessage = "An unexpected error occurred.";
      }
      toast.error(errorMessage);
    } finally {
      setLoginClick(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="sm:text-2xl text-xl font-bold text-white mb-6 text-center">
          Admin Login
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-300 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-6 relative">
            <label htmlFor="password" className="block text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-white bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
                aria-describedby="password-help"
              />
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={toggleShowPassword}
                role="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-white" />
                ) : (
                  <FaEye className="text-white" />
                )}
              </span>
            </div>
            <p id="password-help" className="sr-only">
              {showPassword ? "Password is visible" : "Password is hidden"}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:cursor-pointer hover:bg-blue-600 transition-colors"
            disabled={loginClick}
          >
            {loginClick ? (
              <span className="loading loading-dots loading-sm"></span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>

      {/* Toast notification container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminLogin;
