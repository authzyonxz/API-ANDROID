import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Key, Users, Zap } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.key.getDashboardStats.useQuery();
  const { data: revendedores } = trpc.revendedor.list.useQuery();

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar currentPage="Dashboard" />

      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-black text-white mb-2">Dashboard</h1>
            <p className="text-slate-400 text-lg">
              Bem-vindo ao painel de administração
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Total Keys */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-purple-500/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total de Keys</p>
                  <p className="text-4xl font-black text-white mt-4">
                    {isLoading ? "-" : stats?.totalKeys || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-600/20 to-red-700/20 rounded-xl">
                  <Key className="text-red-500" size={32} />
                </div>
              </div>
            </Card>

            {/* Active Keys */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-green-500/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Keys Ativas</p>
                  <p className="text-4xl font-black text-white mt-4">
                    {isLoading ? "-" : stats?.activeKeys || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-xl">
                  <Zap className="text-green-500" size={32} />
                </div>
              </div>
            </Card>

            {/* Revendedores */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-blue-500/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Revendedores</p>
                  <p className="text-4xl font-black text-white mt-4">
                    {revendedores?.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-xl">
                  <Users className="text-blue-500" size={32} />
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Button
              onClick={() => handleNavigate("/admin/create-keys")}
              className="h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Key className="mr-3" size={24} />
              Criar Keys
            </Button>
            <Button
              onClick={() => handleNavigate("/admin/manage-keys")}
              className="h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Key className="mr-3" size={24} />
              Gerenciar Keys
            </Button>
            <Button
              onClick={() => handleNavigate("/admin/revendedores")}
              className="h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Users className="mr-3" size={24} />
              Revendedores
            </Button>
          </div>

          {/* Welcome Message */}
          <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 p-8 rounded-2xl backdrop-blur-sm">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
              Bem-vindo ao Sistema de Gerenciamento de Chaves
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Use o menu lateral para acessar todas as funcionalidades do sistema. Você pode criar keys, gerenciar revendedores, adicionar créditos e muito mais. Mantenha o controle total sobre suas chaves de proxy.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
