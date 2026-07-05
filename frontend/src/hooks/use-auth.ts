"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  apiLogin,
  apiRegister,
  apiUpdateProfile,
  apiChangePassword,
  apiDeleteAccount,
} from "@/lib/auth-api";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

export function useAuth() {
  const router = useRouter();
  const { user, token, setAuth, setUser, logout: clear } = useAuthStore();

  async function login(email: string, password: string) {
    const res = await apiLogin(email, password);
    if (res.ok) {
      setAuth(res.user, res.token);
      router.push(res.user.role === "admin" ? "/admin" : "/profile");
    }
    return res;
  }

  async function register(input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) {
    const res = await apiRegister(input);
    if (res.ok) {
      setAuth(res.user, res.token);
      router.push("/profile");
    }
    return res;
  }

  function logout() {
    clear();
    useCartStore.getState().clear();
    useWishlistStore.getState().clear();
    router.push("/");
  }

  async function updateProfile(input: { name?: string; phone?: string; email?: string }) {
    if (!token) return { ok: false as const, error: "You're not signed in." };
    const res = await apiUpdateProfile(token, input);
    if (res.ok) setUser(res.data.user);
    return res;
  }

  async function changePassword(input: { currentPassword: string; newPassword: string }) {
    if (!token) return { ok: false as const, error: "You're not signed in." };
    return apiChangePassword(token, input);
  }

  async function deleteAccount() {
    if (!token) return { ok: false as const, error: "You're not signed in." };
    const res = await apiDeleteAccount(token);
    if (res.ok) {
      clear();
      useCartStore.getState().clear();
      useWishlistStore.getState().clear();
      router.push("/");
    }
    return res;
  }

  return {
    user,
    token,
    isAuthenticated: Boolean(token),
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
  };
}
