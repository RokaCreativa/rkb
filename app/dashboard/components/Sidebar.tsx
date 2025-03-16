"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Menu as MenuIcon, 
  Package, 
  Settings,
  Users
} from "lucide-react";

const menuItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard"
  },
  {
    href: "/dashboard/menus",
    icon: MenuIcon,
    label: "Menús"
  },
  {
    href: "/dashboard/products",
    icon: Package,
    label: "Productos"
  },
  {
    href: "/dashboard/users",
    icon: Users,
    label: "Usuarios"
  },
  {
    href: "/dashboard/settings",
    icon: Settings,
    label: "Configuración"
  }
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen hidden lg:block">
      <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="RokaMenu" className="h-8 w-8" />
          <span className="text-xl font-bold">RokaMenu</span>
        </Link>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm ${
                isActive 
                  ? "bg-gray-900 text-white" 
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
