import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

export default function CreateKeys() {
  const [planDays, setPlanDays] = useState<"1" | "7" | "30">("1");
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const createKeysMutation = trpc.key.create.useMutation({
    onSuccess: (data) => {
      setGeneratedKeys(data.keys);
      setShowModal(true);
      toast.success(`${data.keys.length} keys criadas com sucesso!`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar keys");
    },
  });

  const handleCreateKeys = async () => {
    if (quantity < 1 || quantity > 100) {
      toast.error("Quantidade deve ser entre 1 e 100");
      return;
    }

    await createKeysMutation.mutateAsync({
      planDays,
      quantity,
    });
  };

  const handleCopyKey = (key: string, index: number) => {
    navigator.clipboard.writeText(key);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const allKeys = generatedKeys.join("\n");
    navigator.clipboard.writeText(allKeys);
    toast.success("Todas as keys copiadas!");
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar currentPage="Criar Keys" />

      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-8 md:p-12">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-5xl font-black text-white mb-4">Criar Keys</h1>
            <p className="text-slate-400 text-lg">
              Gere novas keys de acesso para proxy Android
            </p>
          </div>

          {/* Create Form */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-10 md:p-12 max-w-2xl rounded-2xl shadow-2xl">
            <div className="space-y-10">
              {/* Plan Selection */}
              <div className="space-y-4">
                <label className="block text-lg font-bold text-white">
                  Plano de Validade
                </label>
                <Select value={planDays} onValueChange={(value: any) => setPlanDays(value)}>
                  <SelectTrigger className="h-14 bg-slate-800 border-slate-700 text-white rounded-xl text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="1" className="text-base">1 Dia (1 Crédito)</SelectItem>
                    <SelectItem value="7" className="text-base">7 Dias (5 Créditos)</SelectItem>
                    <SelectItem value="30" className="text-base">30 Dias (20 Créditos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-4">
                <label className="block text-lg font-bold text-white">
                  Quantidade de Keys
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="h-14 bg-slate-800 border-slate-700 text-white text-base rounded-xl px-4"
                />
                <p className="text-sm text-slate-400">Máximo 100 keys por vez</p>
              </div>

              {/* Cost Info */}
              <div className="p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl">
                <p className="text-white text-lg">
                  <span className="text-slate-300">Custo Total:</span>{" "}
                  <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {planDays === "1"
                      ? quantity * 1
                      : planDays === "7"
                      ? quantity * 5
                      : quantity * 20}{" "}
                    créditos
                  </span>
                </p>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateKeys}
                disabled={createKeysMutation.isPending}
                className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                {createKeysMutation.isPending ? "Gerando..." : "Gerar Keys"}
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Modal de Keys Geradas */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 rounded-2xl p-0">
          <DialogHeader className="p-8 border-b border-slate-700">
            <DialogTitle className="text-3xl font-black text-white">
              Keys Geradas com Sucesso! 🎉
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 p-8">
            {/* Keys List */}
            <div className="max-h-96 overflow-y-auto space-y-3">
              {generatedKeys.map((key, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-purple-500/50 transition-all duration-200"
                >
                  <code className="text-base font-mono text-purple-300 break-all flex-1">
                    {key}
                  </code>
                  <button
                    onClick={() => handleCopyKey(key, index)}
                    className="ml-4 p-3 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                  >
                    {copiedIndex === index ? (
                      <Check size={24} className="text-green-500" />
                    ) : (
                      <Copy size={24} className="text-slate-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-700">
              <Button
                onClick={handleCopyAll}
                className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl"
              >
                Copiar Todas
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-xl"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
