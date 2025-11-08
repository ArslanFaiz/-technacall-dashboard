import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api"; // <- your api.ts
import { Button, Form, Input, Label } from "../components";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(
        "https://technacallcanadabackend-production.up.railway.app/api/auth/login",
        {
          email: email.trim(),
          password: password.trim(),
        }
      );

      if (res.data.success) {
        const user = res.data.data.user;

        // ADMIN check
        if (user.role !== "ADMIN") {
          alert("You do not have permission to login.");
          return; // Stop execution, do not save tokens or navigate
        }

        // Save tokens in localStorage
        localStorage.setItem("accessToken", res.data.data.accessToken);
        localStorage.setItem("refreshToken", res.data.data.refreshToken);

        // Optionally save user info
        localStorage.setItem("user", JSON.stringify(user));

        // Navigate to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        alert(res.data.message || "Login failed");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert("Invalid credentials");
      } else if (err.response?.status === 400) {
        alert(err.response.data.message || "Validation error");
      } else {
        alert("Something went wrong. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg border border-gray-100 rounded-3xl shadow-xl p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
        <h1 className="text-3xl font-bold mb-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Sign in to Your Account
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Please enter your email and password to continue
        </p>

        <Form onSubmit={handleLogin} className="space-y-5 animate-fadeIn">
          {/* Email Field */}
          <div className="group transition-all">
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="you@example.com"
            />
          </div>

          {/* Password Field */}
          <div className="group transition-all">
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </Form>

        <div className="mt-6 text-xs text-gray-400 text-center">
          Tokens stored in localStorage; demo auth
        </div>
      </div>
    </div>
  );
}
