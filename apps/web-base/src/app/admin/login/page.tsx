"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, User, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError(res.status === 401 ? "Sai tên hoặc mật khẩu" : "Lỗi đăng nhập");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Không kết nối được server");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Package className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Agrix Admin</h1>
            <p className="text-sm text-gray-500">Đăng nhập quản trị hệ thống</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tên đăng nhập"
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Mật khẩu"
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
