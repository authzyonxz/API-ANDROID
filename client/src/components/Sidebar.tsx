import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Key, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SidebarProps {
  currentPage: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const { user } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logout realizado com sucesso");
      window.location.href = "/login";
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
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
    <aside className="w-64 bg-gradient-to-b from-slate-950 to-slate-900 text-white h-screen flex flex-col shadow-2xl border-r border-slate-800">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-lg">🛡️</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AUTHPROXY
          </h1>
        </div>
        <p className="text-slate-400 text-xs uppercase tracking-wider">{isAdmin ? "Administrador" : "Revendedor"}</p>
      </div>

      {/* User Info */}
      <div className="p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-slate-800">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Logado como</p>
        <p className="font-semibold text-white truncate text-sm">{user?.username}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.label;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg shadow-purple-600/50"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <Button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 rounded-xl font-semibold transition-all duration-200"
        >
          <LogOut size={18} className="mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
