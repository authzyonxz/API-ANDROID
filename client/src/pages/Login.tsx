import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Language/Settings Bar */}
        <div className="flex justify-between items-center mb-12">
          <div className="w-10 h-10"></div>
          <div className="flex gap-2 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-full px-4 py-2">
            <button className="text-slate-400 hover:text-slate-200 transition text-sm">🌐</button>
            <button className="text-purple-400 font-bold text-sm bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 rounded-full">PT</button>
            <button className="text-slate-400 hover:text-slate-200 transition text-sm">EN</button>
          </div>
          <div className="w-10 h-10"></div>
        </div>

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-purple-600/50">
            <span className="text-5xl">🛡️</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            AUTH<span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">PROXY</span>
          </h1>
          <p className="text-slate-400 text-lg font-light">Gerador Proxy API</p>
        </div>

        {/* Login Form Container */}
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 mb-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Username Field */}
            <div className="space-y-3">
              <label className="block text-slate-300 text-sm font-semibold uppercase tracking-wider">
                Usuário
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">👤</span>
                <Input
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-14 pl-14 pr-4 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all text-base"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label className="block text-slate-300 text-sm font-semibold uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔒</span>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-14 pl-14 pr-12 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-600/50 transform hover:scale-105 active:scale-95 mt-8 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar no Painel
                  <span>→</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-xs uppercase tracking-widest space-y-1">
          <p>© 2026 AUTHPROXY SYSTEMS • ACESSO SEGURO</p>
          <p>TODOS OS DIREITOS RESERVADOS</p>
        </div>
      </div>
    </div>
  );
}
