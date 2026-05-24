import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Pause, Trash2, RotateCcw, Copy } from "lucide-react";

export default function ManageKeys() {
  const { data: keys, isLoading, refetch } = trpc.key.list.useQuery();
  const updateStatusMutation = trpc.key.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const resetDeviceMutation = trpc.key.resetDevice.useMutation({
    onSuccess: () => {
      toast.success("Dispositivo resetado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao resetar dispositivo");
    },
  });

  const handlePauseKey = (keyId: number, currentStatus: string) => {
    const newStatus = currentStatus === "pausado" ? "ativo" : "pausado";
    updateStatusMutation.mutate({ keyId, status: newStatus as any });
  };

  const handleBanKey = (keyId: number) => {
    updateStatusMutation.mutate({ keyId, status: "banido" });
  };

  const handleResetDevice = (keyId: number) => {
    resetDeviceMutation.mutate({ keyId });
  };

  const handleCopyKey = (keyCode: string) => {
    navigator.clipboard.writeText(keyCode);
    toast.success("Key copiada!");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ativo: "bg-green-100 text-green-800",
      pausado: "bg-yellow-100 text-yellow-800",
      banido: "bg-red-100 text-red-800",
      expirado: "bg-gray-100 text-gray-800",
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage="Gerenciar Keys" />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Gerenciar Keys</h1>
            <p className="text-gray-600 mt-2">
              Controle e gerencie suas chaves de acesso
            </p>
          </div>

          {/* Keys Table */}
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Carregando keys...
              </div>
            ) : keys && keys.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b">
                      <TableHead className="font-semibold">Key</TableHead>
                      <TableHead className="font-semibold">Plano</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Ativada</TableHead>
                      <TableHead className="font-semibold">Dispositivo</TableHead>
                      <TableHead className="font-semibold">Criada em</TableHead>
                      <TableHead className="font-semibold text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key) => (
                      <TableRow key={key.id} className="border-b hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {key.keyCode.substring(0, 20)}...
                            </code>
                            <button
                              onClick={() => handleCopyKey(key.keyCode)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Copy size={16} className="text-gray-600" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>{key.planDays} dias</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(key.status)}>
                            {key.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {key.isActivated ? (
                            <Badge className="bg-green-100 text-green-800">Sim</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Não</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {key.deviceId ? (
                            <span className="text-gray-700">{key.deviceId.substring(0, 15)}...</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(key.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handlePauseKey(key.id, key.status)}
                              disabled={key.status === "banido"}
                              className="p-2 hover:bg-yellow-100 rounded text-yellow-600 disabled:opacity-50"
                              title={key.status === "pausado" ? "Ativar" : "Pausar"}
                            >
                              <Pause size={16} />
                            </button>
                            <button
                              onClick={() => handleBanKey(key.id)}
                              disabled={key.status === "banido"}
                              className="p-2 hover:bg-red-100 rounded text-red-600 disabled:opacity-50"
                              title="Banir"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => handleResetDevice(key.id)}
                              disabled={!key.deviceId}
                              className="p-2 hover:bg-blue-100 rounded text-blue-600 disabled:opacity-50"
                              title="Resetar Dispositivo"
                            >
                              <RotateCcw size={16} />
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
                Nenhuma key encontrada. Crie uma nova key para começar.
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
