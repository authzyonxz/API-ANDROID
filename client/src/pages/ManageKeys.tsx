import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      ativo: "bg-green-500/20 text-green-400 border border-green-500/50",
      pausado: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50",
      banido: "bg-red-500/20 text-red-400 border border-red-500/50",
      expirado: "bg-slate-500/20 text-slate-400 border border-slate-500/50",
    };
    return variants[status] || "bg-slate-500/20 text-slate-400 border border-slate-500/50";
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar currentPage="Gerenciar Keys" />

      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-8 md:p-12">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-5xl font-black text-white mb-4">Gerenciar Keys</h1>
            <p className="text-slate-400 text-lg">
              Controle e gerencie suas chaves de acesso
            </p>
          </div>

          {/* Keys List */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-lg">Carregando keys...</p>
            </div>
          ) : keys && keys.length > 0 ? (
            <div className="space-y-6">
              {keys.map((key) => (
                <Card
                  key={key.id}
                  className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-purple-500/50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Key Info */}
                    <div className="space-y-6">
                      <div>
                        <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Key</p>
                        <div className="flex items-center gap-3">
                          <code className="flex-1 bg-slate-800 px-4 py-3 rounded-lg text-purple-300 font-mono text-sm break-all">
                            {key.keyCode}
                          </code>
                          <button
                            onClick={() => handleCopyKey(key.keyCode)}
                            className="p-3 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Copy size={20} className="text-slate-400 hover:text-white" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Plano</p>
                          <p className="text-white text-lg font-bold">{key.planDays} dias</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Status</p>
                          <Badge className={`${getStatusBadge(key.status)} text-base font-bold px-4 py-2`}>
                            {key.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Ativada</p>
                          <Badge className={key.isActivated ? "bg-green-500/20 text-green-400 border border-green-500/50 text-base font-bold px-4 py-2" : "bg-slate-500/20 text-slate-400 border border-slate-500/50 text-base font-bold px-4 py-2"}>
                            {key.isActivated ? "Sim" : "Não"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Criada em</p>
                          <p className="text-white font-semibold">{new Date(key.createdAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 flex flex-col justify-center">
                      <div>
                        <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4">Dispositivo</p>
                        <p className="text-white font-mono text-sm mb-6">
                          {key.deviceId ? key.deviceId : <span className="text-slate-500">Nenhum dispositivo vinculado</span>}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Button
                          onClick={() => handlePauseKey(key.id, key.status)}
                          disabled={key.status === "banido"}
                          className="w-full h-12 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Pause size={18} className="mr-2" />
                          {key.status === "pausado" ? "Ativar" : "Pausar"}
                        </Button>
                        <Button
                          onClick={() => handleResetDevice(key.id)}
                          disabled={!key.deviceId}
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <RotateCcw size={18} className="mr-2" />
                          Resetar Dispositivo
                        </Button>
                        <Button
                          onClick={() => handleBanKey(key.id)}
                          disabled={key.status === "banido"}
                          className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Trash2 size={18} className="mr-2" />
                          Banir Key
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-12 rounded-2xl text-center">
              <p className="text-slate-400 text-lg">
                Nenhuma key encontrada. Crie uma nova key para começar.
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
