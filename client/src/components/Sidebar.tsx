import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Key, Users, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SidebarProps {
  currentPage: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logout realizado com sucesso");
      window.location.href = "/login";
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isAdmin = user?.role === "admin";
  const basePath = isAdmin ? "/admin" : "/revendedor";

  const menuItems = isAdmin
    ? [
        { icon: Home, label: "Dashboard", path: `${basePath}/dashboard` },
        { icon: Key, label: "Criar Keys", path: `${basePath}/create-keys` },
        { icon: Key, label: "Gerenciar Keys", path: `${basePath}/manage-keys` },
        { icon: Users, label: "Revendedores", path: `${basePath}/revendedores` },
      ]
    : [
        { icon: Home, label: "Dashboard", path: `${basePath}/dashboard` },
        { icon: Key, label: "Criar Keys", path: `${basePath}/create-keys` },
        { icon: Key, label: "Minhas Keys", path: `${basePath}/manage-keys` },
      ];

  return (
    <aside className="w-64 bg-red-600 text-white h-screen flex flex-col shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-red-700">
        <h1 className="text-2xl font-bold">KEY PROXY</h1>
        <p className="text-red-100 text-sm mt-1">{isAdmin ? "Administrador" : "Revendedor"}</p>
      </div>

      {/* User Info */}
      <div className="p-4 bg-red-700">
        <p className="text-sm text-red-100">Logado como:</p>
        <p className="font-semibold text-white truncate">{user?.username}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.label;
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-white text-red-600 font-semibold"
                  : "text-red-100 hover:bg-red-700"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-red-700">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full bg-red-700 hover:bg-red-800 text-white border-red-500"
        >
          <LogOut size={18} className="mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
