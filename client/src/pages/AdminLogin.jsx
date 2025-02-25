import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-free/css/all.min.css";

const AdminLogin = ({ onLogin }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/login",
        credentials
      );

      // Ensure the token is present in response
      if (!data.token) {
        throw new Error("Authentication failed");
      }

      localStorage.setItem("adminToken", data.token);
      onLogin(true);
      toast.success("Logged in successfully");
      navigate("/home");
    } catch (error) {
      let errorMessage = "Login failed. Please check your credentials.";

      // Handle different error cases
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server. Please try again.";
      } else {
        errorMessage = "An unexpected error occurred.";
      }

      toast.error(errorMessage);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Admin Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6 relative">
            <label className="block text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-white bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={toggleShowPassword}
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  className="text-white"
                />
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:cursor-pointer hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
      {/* Toast notification container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminLogin;
