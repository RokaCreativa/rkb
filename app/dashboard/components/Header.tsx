"use client";

import { signOut, useSession } from "next-auth/react";
import { Menu, LogOut, User } from "lucide-react";
import Link from "next/link";

const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <button className="lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            RokaMenu
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-700">{session?.user?.email}</span>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
