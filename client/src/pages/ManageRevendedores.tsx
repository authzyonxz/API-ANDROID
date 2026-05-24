import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage="Revendedores" />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Gerenciar Revendedores</h1>
              <p className="text-gray-600 mt-2">
                Crie e gerencie revendedores do sistema
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus size={20} className="mr-2" />
              Novo Revendedor
            </Button>
          </div>

          {/* Revendedores Table */}
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Carregando revendedores...
              </div>
            ) : revendedores && revendedores.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Créditos</TableHead>
                      <TableHead className="font-semibold">Criado em</TableHead>
                      <TableHead className="font-semibold text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revendedores.map((revendedor) => (
                      <TableRow key={revendedor.id} className="border-b hover:bg-gray-50">
                        <TableCell className="font-semibold">
                          #{revendedor.id}
                        </TableCell>
                        <TableCell className="text-lg font-bold text-red-600">
                          {parseFloat(revendedor.creditBalance.toString()).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(revendedor.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setSelectedRevendedor(revendedor);
                                setShowAddCreditModal(true);
                              }}
                              className="p-2 hover:bg-yellow-100 rounded text-yellow-600"
                              title="Adicionar Crédito"
                            >
                              <Zap size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Nenhum revendedor encontrado. Crie um novo revendedor para começar.
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Create Revendedor Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Revendedor</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <Input
                type="text"
                placeholder="Digite o usuário"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <Input
                type="password"
                placeholder="Digite a senha"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Créditos Iniciais
              </label>
              <Input
                type="number"
                placeholder="0"
                value={formData.creditBalance}
                onChange={(e) =>
                  setFormData({ ...formData, creditBalance: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateRevendedor}
                disabled={createRevendedorMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {createRevendedorMutation.isPending ? "Criando..." : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Credit Modal */}
      <Dialog open={showAddCreditModal} onOpenChange={setShowAddCreditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Créditos</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revendedor: #{selectedRevendedor?.id}
              </label>
              <p className="text-sm text-gray-600">
                Créditos atuais:{" "}
                <span className="font-bold text-red-600">
                  {parseFloat(selectedRevendedor?.creditBalance.toString() || "0").toFixed(2)}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade de Créditos
              </label>
              <Input
                type="number"
                placeholder="0"
                value={creditAmount}
                onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowAddCreditModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddCredit}
                disabled={addCreditMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
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
