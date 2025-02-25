import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import DisplayPage from "./pages/DisplayPage.jsx";
import Login from "./pages/AdminLogin.jsx";
import "./App.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if adminToken exists on page reload
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (status) => {
    setIsLoggedIn(status);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate replace to="/home" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/home"
          element={isLoggedIn ? <DisplayPage /> : <Navigate replace to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
