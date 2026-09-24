import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  User as UserIcon,
  Key,
  LogIn,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
  GraduationCap,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { users, login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setError(res.error || 'Credenciais inválidas.');
        setIsLoading(false);
      }
      // On success, AuthContext updates currentUser and App switches to main dashboard
    }, 200);
  };

  const handleSelectAccount = (userUsername: string) => {
    setUsername(userUsername);
    setPassword('');
    setError(null);
    const passInput = document.getElementById('login-password-input');
    if (passInput) passInput.focus();
  };

  return (
    <div className="min-h-screen bg-[#090d33] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#C8102E]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#BAFF38]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[15%] w-[300px] h-[300px] bg-[#2563EB]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand / Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C8102E] flex items-center justify-center shadow-lg shadow-[#C8102E]/30 text-white font-black text-2xl tracking-tighter">
              G
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5 font-['Nunito']">
                <span>GRAN</span>
                <span className="text-[#BAFF38]">EDITAL</span>
              </div>
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest">
                Plataforma de Estudos &amp; IA
              </p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-white/10 p-7 sm:p-8 space-y-6 backdrop-blur-md">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-[#0D134C] font-['Nunito'] tracking-tight flex items-center gap-2">
              <span>Entrar na Plataforma</span>
              <Sparkles className="w-4 h-4 text-[#C8102E]" />
            </h2>
            <p className="text-xs text-gray-500">
              Digite seu usuário e senha para acessar seus editais e cronogramas.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="font-semibold">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Usuário / Login:
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-gray-400 font-mono font-bold text-xs select-none">
                  @
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin ou seu nome"
                  className="w-full pl-8 pr-3.5 py-3 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-[#0D134C] focus:ring-2 focus:ring-[#0D134C]/10 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                  Senha de Acesso:
                </label>
                <span className="text-[10px] text-gray-400">Protegida</span>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 select-none" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#0D134C] focus:ring-2 focus:ring-[#0D134C]/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full py-3.5 px-4 bg-[#0D134C] hover:bg-[#151c6b] text-white rounded-xl text-xs font-black tracking-wide shadow-lg shadow-[#0D134C]/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {isLoading ? (
                <span>Validando acesso...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#BAFF38]" />
                  <span>Acessar Meus Estudos</span>
                </>
              )}
            </button>
          </form>

          {/* Quick User Picker */}
          {users.length > 0 && (
            <div className="pt-4 border-t border-gray-100 space-y-2.5">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">
                Selecione uma conta cadastrada para preencher:
              </span>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {users.map((u) => {
                  const isSelected = username.toLowerCase() === u.username.toLowerCase();
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectAccount(u.username)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 border-[#0D134C] shadow-xs'
                          : 'bg-gray-50/70 hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-xs"
                          style={{ backgroundColor: u.color || '#0D134C' }}
                        >
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-[#0D134C] truncate">{u.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">@{u.username}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            u.role === 'admin'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {u.role === 'admin' ? 'Admin' : 'Aluno'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom security features banner */}
        <div className="flex items-center justify-center gap-6 text-[11px] font-semibold text-white/50">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#BAFF38]" />
            <span>Ambiente 100% Isolado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#BAFF38]" />
            <span>Sincronização em Nuvem</span>
          </div>
        </div>
      </div>
    </div>
  );
};
