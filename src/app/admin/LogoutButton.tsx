"use client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
    >
      Log out
    </button>
  );
}
