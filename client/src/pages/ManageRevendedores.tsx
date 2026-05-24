import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Zap } from "lucide-react";

export default function ManageRevendedores() {
  const { data: revendedores, isLoading, refetch } = trpc.revendedor.list.useQuery();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  const [selectedRevendedor, setSelectedRevendedor] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    creditBalance: 0,
  });

  const createRevendedorMutation = trpc.revendedor.create.useMutation({
    onSuccess: () => {
      toast.success("Revendedor criado com sucesso!");
      setFormData({ username: "", password: "", creditBalance: 0 });
      setShowCreateModal(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar revendedor");
    },
  });

  const addCreditMutation = trpc.revendedor.addCredit.useMutation({
    onSuccess: () => {
      toast.success("Créditos adicionados com sucesso!");
      setCreditAmount(0);
      setShowAddCreditModal(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar créditos");
    },
  });

  const handleCreateRevendedor = async () => {
    if (!formData.username || !formData.password) {
      toast.error("Preencha todos os campos");
      return;
    }

    await createRevendedorMutation.mutateAsync({
      username: formData.username,
      password: formData.password,
      creditBalance: formData.creditBalance,
    });
  };

  const handleAddCredit = async () => {
    if (!selectedRevendedor || creditAmount <= 0) {
      toast.error("Valores inválidos");
      return;
    }

    await addCreditMutation.mutateAsync({
      revendedorId: selectedRevendedor.id,
      amount: creditAmount,
    });
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar currentPage="Revendedores" />

      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-8 md:p-12">
          {/* Header */}
          <div className="mb-16 flex items-center justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-5xl font-black text-white mb-4">Gerenciar Revendedores</h1>
              <p className="text-slate-400 text-lg">
                Crie e gerencie revendedores do sistema
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all"
            >
              <Plus size={24} className="mr-2" />
              Novo Revendedor
            </Button>
          </div>

          {/* Revendedores List */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-lg">Carregando revendedores...</p>
            </div>
          ) : revendedores && revendedores.length > 0 ? (
            <div className="space-y-6">
              {revendedores.map((revendedor) => (
                <Card
                  key={revendedor.id}
                  className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-purple-500/50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* Info */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">ID</p>
                        <p className="text-white text-2xl font-black">#{revendedor.id}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Usuário</p>
                        <p className="text-white text-lg font-bold">{revendedor.username}</p>
                      </div>
                    </div>

                    {/* Credits */}
                    <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 p-6 rounded-xl">
                      <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-3">Créditos Disponíveis</p>
                      <p className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                        {parseFloat(revendedor.creditBalance.toString()).toFixed(2)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => {
                          setSelectedRevendedor(revendedor);
                          setShowAddCreditModal(true);
                        }}
                        className="w-full h-12 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold rounded-lg transition-all"
                      >
                        <Zap size={18} className="mr-2" />
                        Adicionar Créditos
                      </Button>
                      <p className="text-xs text-slate-400 text-center">
                        Criado em: {new Date(revendedor.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-12 rounded-2xl text-center">
              <p className="text-slate-400 text-lg">
                Nenhum revendedor encontrado. Crie um novo revendedor para começar.
              </p>
            </Card>
          )}
        </div>
      </main>

      {/* Create Revendedor Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-slate-900 border-slate-700 rounded-2xl p-0">
          <DialogHeader className="p-8 border-b border-slate-700">
            <DialogTitle className="text-2xl font-black text-white">Criar Novo Revendedor</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 p-8">
            <div className="space-y-3">
              <label className="block text-lg font-bold text-white">
                Usuário
              </label>
              <Input
                type="text"
                placeholder="Digite o usuário"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="h-12 bg-slate-800 border-slate-700 text-white rounded-lg text-base"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-lg font-bold text-white">
                Senha
              </label>
              <Input
                type="password"
                placeholder="Digite a senha"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 bg-slate-800 border-slate-700 text-white rounded-lg text-base"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-lg font-bold text-white">
                Créditos Iniciais
              </label>
              <Input
                type="number"
                placeholder="0"
                value={formData.creditBalance}
                onChange={(e) =>
                  setFormData({ ...formData, creditBalance: parseInt(e.target.value) || 0 })
                }
                className="h-12 bg-slate-800 border-slate-700 text-white rounded-lg text-base"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-700">
              <Button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateRevendedor}
                disabled={createRevendedorMutation.isPending}
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg"
              >
                {createRevendedorMutation.isPending ? "Criando..." : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Credit Modal */}
      <Dialog open={showAddCreditModal} onOpenChange={setShowAddCreditModal}>
        <DialogContent className="bg-slate-900 border-slate-700 rounded-2xl p-0">
          <DialogHeader className="p-8 border-b border-slate-700">
            <DialogTitle className="text-2xl font-black text-white">Adicionar Créditos</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 p-8">
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 p-6 rounded-xl">
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">
                Revendedor: #{selectedRevendedor?.id}
              </p>
              <p className="text-white text-lg">
                Créditos atuais:{" "}
                <span className="font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {parseFloat(selectedRevendedor?.creditBalance.toString() || "0").toFixed(2)}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-lg font-bold text-white">
                Quantidade de Créditos
              </label>
              <Input
                type="number"
                placeholder="0"
                value={creditAmount}
                onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                className="h-12 bg-slate-800 border-slate-700 text-white rounded-lg text-base"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-700">
              <Button
                onClick={() => setShowAddCreditModal(false)}
                className="flex-1 h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddCredit}
                disabled={addCreditMutation.isPending}
                className="flex-1 h-12 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold rounded-lg"
              >
                {addCreditMutation.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
