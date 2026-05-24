import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Key, Zap, TrendingUp } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function RevendedorDashboard() {
  const { data: stats, isLoading } = trpc.key.getDashboardStats.useQuery();

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar currentPage="Dashboard" />

      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-1 md:mb-2">Meu Dashboard</h1>
            <p className="text-slate-400 text-sm md:text-lg">
              Acompanhe suas keys e créditos disponíveis
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-12">
            {/* Total Keys */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-red-500/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-xs md:text-sm font-semibold uppercase tracking-wider">Minhas Keys</p>
                  <p className="text-2xl md:text-4xl font-black text-white mt-2 md:mt-4">
                    {isLoading ? "-" : stats?.totalKeys || 0}
                  </p>
                </div>
                <div className="p-2 md:p-3 bg-gradient-to-br from-red-600/20 to-red-700/20 rounded-lg md:rounded-xl">
                  <Key className="text-red-500 md:size-8" size={24} />
                </div>
              </div>
            </Card>

            {/* Active Keys */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-green-500/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-xs md:text-sm font-semibold uppercase tracking-wider">Keys Ativas</p>
                  <p className="text-2xl md:text-4xl font-black text-white mt-2 md:mt-4">
                    {isLoading ? "-" : stats?.activeKeys || 0}
                  </p>
                </div>
                <div className="p-2 md:p-3 bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-lg md:rounded-xl">
                  <TrendingUp className="text-green-500 md:size-8" size={24} />
                </div>
              </div>
            </Card>

            {/* Available Credits */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-yellow-500/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-xs md:text-sm font-semibold uppercase tracking-wider">Créditos</p>
                  <p className="text-2xl md:text-4xl font-black text-white mt-2 md:mt-4">
                    {isLoading ? "-" : stats?.creditBalance || 0}
                  </p>
                </div>
                <div className="p-2 md:p-3 bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 rounded-lg md:rounded-xl">
                  <Zap className="text-yellow-500 md:size-8" size={24} />
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-12">
            <Button
              onClick={() => handleNavigate("/revendedor/create-keys")}
              className="h-10 md:h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-sm md:text-lg rounded-lg md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Key className="mr-2 md:mr-3 md:size-6" size={18} />
              Criar Keys
            </Button>
            <Button
              onClick={() => handleNavigate("/revendedor/manage-keys")}
              className="h-10 md:h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-sm md:text-lg rounded-lg md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Key className="mr-2 md:mr-3 md:size-6" size={18} />
              Minhas Keys
            </Button>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Pricing Info */}
            <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 p-4 md:p-8 rounded-lg md:rounded-2xl backdrop-blur-sm">
              <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3 md:mb-6">
                Tabela de Preços
              </h2>
              <div className="space-y-2 md:space-y-4">
                <div className="flex justify-between items-center p-2 md:p-3 bg-slate-900/50 rounded-lg text-sm md:text-base">
                  <span className="text-slate-300 font-medium">1 Dia</span>
                  <span className="font-bold text-purple-400">1 Crédito</span>
                </div>
                <div className="flex justify-between items-center p-2 md:p-3 bg-slate-900/50 rounded-lg text-sm md:text-base">
                  <span className="text-slate-300 font-medium">7 Dias</span>
                  <span className="font-bold text-purple-400">5 Créditos</span>
                </div>
                <div className="flex justify-between items-center p-2 md:p-3 bg-slate-900/50 rounded-lg text-sm md:text-base">
                  <span className="text-slate-300 font-medium">30 Dias</span>
                  <span className="font-bold text-purple-400">20 Créditos</span>
                </div>
              </div>
            </Card>

            {/* Help Info */}
            <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 p-4 md:p-8 rounded-lg md:rounded-2xl backdrop-blur-sm">
              <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3 md:mb-6">
                Como Funciona
              </h2>
              <div className="space-y-2 md:space-y-3 text-slate-300 text-sm md:text-base">
                <p className="flex items-start gap-2 md:gap-3">
                  <span className="text-purple-400 font-bold mt-0.5 flex-shrink-0">1.</span>
                  <span>Crie suas keys com o plano desejado</span>
                </p>
                <p className="flex items-start gap-2 md:gap-3">
                  <span className="text-purple-400 font-bold mt-0.5 flex-shrink-0">2.</span>
                  <span>Cada key custará créditos conforme o plano</span>
                </p>
                <p className="flex items-start gap-2 md:gap-3">
                  <span className="text-purple-400 font-bold mt-0.5 flex-shrink-0">3.</span>
                  <span>Gerencie suas keys ativas a qualquer momento</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
