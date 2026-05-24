import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Login realizado com sucesso!");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl mb-6 shadow-lg">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Proxy Manager</h1>
          <p className="text-gray-600 text-lg">Sistema de Gerenciamento de Chaves</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
          <div className="bg-gradient-to-r from-red-600 to-red-700 h-1.5"></div>
          
          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-gray-800">
                  Usuário
                </label>
                <Input
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-lg pl-4 transition-all"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-gray-800">
                  Senha
                </label>
                <Input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-lg pl-4 transition-all"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            {/* Info Message */}
            <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl flex gap-3">
              <span className="text-2xl flex-shrink-0">ℹ️</span>
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Primeira vez?</p>
                <p className="text-blue-800">Entre em contato com o administrador para obter suas credenciais de acesso.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>© 2026 Proxy Manager. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
