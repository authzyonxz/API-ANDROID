import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Key, Zap, TrendingUp } from "lucide-react";

export default function RevendedorDashboard() {
  const { data: stats, isLoading } = trpc.key.getDashboardStats.useQuery();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage="Dashboard" />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Meu Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Acompanhe suas keys e créditos disponíveis
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Keys */}
            <Card className="p-6 border-l-4 border-l-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Minhas Keys</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {isLoading ? "-" : stats?.totalKeys || 0}
                  </p>
                </div>
                <Key className="text-red-600" size={40} />
              </div>
            </Card>

            {/* Active Keys */}
            <Card className="p-6 border-l-4 border-l-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Keys Ativas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {isLoading ? "-" : stats?.activeKeys || 0}
                  </p>
                </div>
                <TrendingUp className="text-green-600" size={40} />
              </div>
            </Card>

            {/* Available Credits */}
            <Card className="p-6 border-l-4 border-l-yellow-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Créditos Disponíveis</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {isLoading ? "-" : stats?.creditBalance || 0}
                  </p>
                </div>
                <Zap className="text-yellow-600" size={40} />
              </div>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pricing Info */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h2 className="text-lg font-bold text-blue-900 mb-4">Tabela de Preços</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-800">1 Dia</span>
                  <span className="font-bold text-blue-900">1 Crédito</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-800">7 Dias</span>
                  <span className="font-bold text-blue-900">5 Créditos</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-800">30 Dias</span>
                  <span className="font-bold text-blue-900">15 Créditos</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-red-50 border-red-200">
              <h2 className="text-lg font-bold text-red-900 mb-4">Ações Rápidas</h2>
              <p className="text-red-800 text-sm mb-4">
                Use o menu lateral para:
              </p>
              <ul className="space-y-2 text-red-800 text-sm">
                <li>✓ Criar novas keys</li>
                <li>✓ Gerenciar suas keys</li>
                <li>✓ Acompanhar créditos</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
