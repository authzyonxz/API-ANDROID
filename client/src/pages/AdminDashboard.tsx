import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, Key, Users } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.key.getDashboardStats.useQuery();
  const { data: revendedores } = trpc.revendedor.list.useQuery();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage="Dashboard" />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Bem-vindo ao painel de administração
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Keys */}
            <Card className="p-6 border-l-4 border-l-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total de Keys</p>
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
                <BarChart3 className="text-green-600" size={40} />
              </div>
            </Card>

            {/* Revendedores */}
            <Card className="p-6 border-l-4 border-l-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Revendedores</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {revendedores?.length || 0}
                  </p>
                </div>
                <Users className="text-blue-600" size={40} />
              </div>
            </Card>
          </div>

          {/* Welcome Message */}
          <Card className="p-6 bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <h2 className="text-xl font-bold text-red-900 mb-2">
              Bem-vindo ao Sistema de Gerenciamento de Chaves
            </h2>
            <p className="text-red-800">
              Use o menu lateral para acessar as funcionalidades do sistema. Você pode criar
              keys, gerenciar revendedores, adicionar créditos e muito mais.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
