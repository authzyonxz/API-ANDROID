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
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage="Criar Keys" />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Criar Keys</h1>
            <p className="text-gray-600 mt-2">
              Gere novas keys de acesso para proxy Android
            </p>
          </div>

          {/* Create Form */}
          <Card className="p-8 max-w-md">
            <div className="space-y-6">
              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plano de Validade
                </label>
                <Select value={planDays} onValueChange={(value: any) => setPlanDays(value)}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Dia (1 Crédito)</SelectItem>
                    <SelectItem value="7">7 Dias (5 Créditos)</SelectItem>
                    <SelectItem value="30">30 Dias (15 Créditos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="border-gray-300"
                />
                <p className="text-xs text-gray-500 mt-2">Máximo 100 keys por vez</p>
              </div>

              {/* Cost Info */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-gray-700">
                  <strong>Custo Total:</strong>{" "}
                  <span className="text-red-600 font-bold">
                    {planDays === "1"
                      ? quantity * 1
                      : planDays === "7"
                      ? quantity * 5
                      : quantity * 15}{" "}
                    créditos
                  </span>
                </p>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateKeys}
                disabled={createKeysMutation.isPending}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2"
              >
                {createKeysMutation.isPending ? "Gerando..." : "Gerar Keys"}
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Modal de Keys Geradas */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Keys Geradas com Sucesso!</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Keys List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {generatedKeys.map((key, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-red-300 transition-colors"
                >
                  <code className="text-sm font-mono text-gray-700 break-all">
                    {key}
                  </code>
                  <button
                    onClick={() => handleCopyKey(key, index)}
                    className="ml-2 p-2 hover:bg-gray-200 rounded transition-colors"
                  >
                    {copiedIndex === index ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-gray-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleCopyAll}
                variant="outline"
                className="flex-1"
              >
                Copiar Todas
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
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
