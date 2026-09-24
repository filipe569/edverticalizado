import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConcurso } from '../context/ConcursoContext';
import { LogIn, Key, User as UserIcon, Shield, Sparkles, X, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
}) => {
  const { login, users, switchUserDirect } = useAuth();
  const { showToast } = useConcurso();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = login(username, password);
    if (!res.success) {
      setError(res.error || 'Credenciais inválidas.');
      return;
    }

    showToast('👋', `Bem-vindo de volta, ${username}!`);
    onClose();
  };

  const handleSelectUser = (uUsername: string) => {
    setUsername(uUsername);
    setPassword('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0D134C]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D134C] via-[#1a2060] to-[#2a1a45] text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3 border border-white/20">
            <LogIn className="w-6 h-6 text-[#BAFF38]" />
          </div>

          <h2 className="text-xl font-black font-['Nunito']">
            Acesso ao Edital Verticalizado
          </h2>
          <p className="text-xs text-white/70 mt-1">
            Selecione seu perfil ou digite seu login para acessar seus estudos exclusivos.
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 font-bold text-center">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Nome de Usuário
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="ex: admin ou aluno"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0D134C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Senha
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0D134C]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0D134C] hover:bg-[#1a2060] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition flex items-center justify-center gap-2 mt-2"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-4 h-4 text-[#BAFF38]" />
            </button>
          </form>

          {/* Seleção de Contas Cadastradas */}
          <div className="pt-4 border-t border-gray-100">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center mb-2">
              Selecione sua conta para preencher o login:
            </span>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUser(u.username)}
                  className={`w-full p-2 rounded-xl border text-left flex items-center justify-between text-xs transition cursor-pointer ${
                    username.toLowerCase() === u.username.toLowerCase()
                      ? 'bg-blue-50/60 border-[#0D134C]'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: u.color || '#0D134C' }}
                    />
                    <span className="font-extrabold text-[#0D134C] truncate">{u.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">(@{u.username})</span>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      u.role === 'admin'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
