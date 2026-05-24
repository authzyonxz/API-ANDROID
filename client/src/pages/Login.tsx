import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Login realizado com sucesso!");
      // Redirect based on role
      if (data.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/revendedor/dashboard";
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginMutation.mutateAsync({ username, password });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-red-200">
        <div className="p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-600 mb-2">
              KEY PROXY
            </h1>
            <p className="text-gray-600">
              Sistema de Gerenciamento de Chaves
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <Input
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-gray-600 mb-2">
              <strong>Credenciais de Demonstração (Admin):</strong>
            </p>
            <p className="text-xs text-gray-700">
              Usuário: <code className="bg-white px-1 rounded">ADMINISTRADOR</code>
            </p>
            <p className="text-xs text-gray-700">
              Senha: <code className="bg-white px-1 rounded">ADMIN123</code>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
