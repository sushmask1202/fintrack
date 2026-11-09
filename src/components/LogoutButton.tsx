"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })} className="dk-btn dk-btn-ghost dk-btn-sm">
      Log out
    </button>
  );
}