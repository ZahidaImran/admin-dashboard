"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "anieeimran@gmail.com" && password === "aniee123") {
      localStorage.setItem("isLoggedIn", "true");
      router.push("/admin/dashboard");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
      <div className="w-full max-w-md bg-white bg-opacity-20 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white border-opacity-30">
        <h2 className="text-3xl font-bold text-center text-black mb-6">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-white font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-white bg-opacity-20 text-black placeholder-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={email}
              required
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-white bg-opacity-20 text-black placeholder-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={password}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-400 text-gray-900 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
