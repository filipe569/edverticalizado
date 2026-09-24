import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConcurso } from '../context/ConcursoContext';
import { User } from '../types/concurso';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  LogIn,
  AlertCircle,
  Sparkles,
  User as UserIcon,
  Lock,
  LogOut,
  Cpu,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
}

const AVATAR_COLORS = [
  '#0D134C',
  '#C8102E',
  '#059669',
  '#2563EB',
  '#7C3AED',
  '#D97706',
  '#DB2777',
  '#4B5563',
];

interface GeminiStatus {
  hasKey: boolean;
  isCustom: boolean;
  maskedKey: string;
  source: 'custom' | 'environment' | 'none';
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  const { currentUser, users, createUser, updateUser, deleteUser, switchUserDirect } = useAuth();
  const { showToast } = useConcurso();

  const isAdmin = currentUser?.role === 'admin';

  // Admin tabs: lista | novo | gemini
  const [activeTab, setActiveTab] = useState<'lista' | 'novo' | 'gemini'>('lista');

  // Delete confirmation state (inline, avoiding blocked window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // New user form state (admin only)
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'aluno'>('aluno');
  const [newColor, setNewColor] = useState(AVATAR_COLORS[0]);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit user state (admin only)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'aluno'>('aluno');

  // Student self-edit state
  const [studentName, setStudentName] = useState(currentUser?.name || '');
  const [studentPassword, setStudentPassword] = useState(currentUser?.password || '');
  const [studentColor, setStudentColor] = useState(currentUser?.color || AVATAR_COLORS[0]);

  // Gemini API Key config state (admin only)
  const [geminiStatus, setGeminiStatus] = useState<GeminiStatus | null>(null);
  const [inputApiKey, setInputApiKey] = useState('');
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResponse, setTestResponse] = useState<{
    success: boolean;
    message: string;
    response?: string;
  } | null>(null);

  // Fetch Gemini status when admin opens the modal or switches to 'gemini' tab
  const fetchGeminiStatus = () => {
    fetch('/api/admin/gemini-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGeminiStatus({
            hasKey: data.hasKey,
            isCustom: data.isCustom,
            maskedKey: data.maskedKey,
            source: data.source,
          });
        }
      })
      .catch((e) => console.warn('Erro ao consultar status do Gemini:', e));
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchGeminiStatus();
    }
  }, [isOpen, isAdmin, activeTab]);

  // Keep student state synced when modal opens
  useEffect(() => {
    if (currentUser) {
      setStudentName(currentUser.name);
      setStudentPassword(currentUser.password);
      setStudentColor(currentUser.color || AVATAR_COLORS[0]);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  // Student saving own profile
  const handleSaveStudentProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!studentPassword.trim()) {
      showToast('⚠️', 'A senha não pode ser vazia.');
      return;
    }

    const res = updateUser(currentUser.id, {
      name: studentName.trim() || currentUser.username,
      password: studentPassword.trim(),
      color: studentColor,
    });

    if (!res.success) {
      showToast('⚠️', res.error || 'Erro ao atualizar dados.');
      return;
    }

    showToast('✅', 'Seu perfil foi atualizado com sucesso!');
    onClose();
  };

  // Admin creating user
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setFormError('Apenas administradores podem criar usuários.');
      return;
    }
    setFormError(null);

    const res = createUser({
      username: newUsername,
      name: newName,
      password: newPassword,
      role: newRole,
      color: newColor,
    });

    if (!res.success) {
      setFormError(res.error || 'Erro ao criar usuário.');
      return;
    }

    showToast('👤', `Usuário "${newUsername}" criado com sucesso!`);
    setNewUsername('');
    setNewName('');
    setNewPassword('');
    setNewRole('aluno');
    setActiveTab('lista');
  };

  const handleStartEdit = (user: User) => {
    if (!isAdmin) return;
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditPassword(user.password);
    setEditRole(user.role);
    setConfirmDeleteId(null);
  };

  const handleSaveEdit = (userId: string) => {
    if (!isAdmin) return;
    const res = updateUser(userId, {
      name: editName,
      password: editPassword,
      role: editRole,
    });

    if (!res.success) {
      showToast('⚠️', res.error || 'Erro ao atualizar.');
      return;
    }

    showToast('✅', 'Usuário atualizado com sucesso!');
    setEditingUserId(null);
  };

  const executeDelete = (userId: string, username: string) => {
    if (!isAdmin) return;
    const res = deleteUser(userId);
    if (!res.success) {
      showToast('⚠️', res.error || 'Erro ao excluir.');
      setConfirmDeleteId(null);
      return;
    }
    showToast('🗑️', `Usuário "${username}" removido.`);
    setConfirmDeleteId(null);
  };

  const handleSwitchUser = (userId: string, name: string) => {
    if (!isAdmin) return;
    switchUserDirect(userId);
    showToast('🔄', `Sessão alterada para: ${name}`);
    onClose();
  };

  // Save new Gemini API Key
  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setIsSavingKey(true);
    try {
      const res = await fetch('/api/admin/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: inputApiKey }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('🔑', inputApiKey ? 'Chave Gemini salva com sucesso!' : 'Chave personalizada removida.');
        setInputApiKey('');
        fetchGeminiStatus();
      } else {
        showToast('⚠️', data.error || 'Erro ao salvar chave.');
      }
    } catch {
      showToast('⚠️', 'Erro de conexão com o servidor.');
    } finally {
      setIsSavingKey(false);
    }
  };

  // Reset to default env key
  const handleResetGeminiKey = async () => {
    if (!isAdmin) return;
    setIsSavingKey(true);
    try {
      const res = await fetch('/api/admin/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: '' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('🔄', 'Restaurado para a chave padrão do servidor.');
        fetchGeminiStatus();
      }
    } catch {
      showToast('⚠️', 'Falha ao restaurar chave padrão.');
    } finally {
      setIsSavingKey(false);
    }
  };

  // Test Gemini Connection
  const handleTestGemini = async () => {
    if (!isAdmin) return;
    setIsTestingKey(true);
    setTestResponse(null);

    try {
      const res = await fetch('/api/admin/test-gemini', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setTestResponse({
          success: true,
          message: data.message || 'Conexão bem sucedida com o Gemini!',
          response: data.response,
        });
        showToast('✨', 'Gemini testado e funcionando!');
      } else {
        setTestResponse({
          success: false,
          message: data.error || 'O modelo Gemini não respondeu.',
        });
        showToast('⚠️', 'Falha ao testar chave Gemini.');
      }
    } catch (err: any) {
      setTestResponse({
        success: false,
        message: 'Erro de rede ou servidor ao testar API do Gemini.',
      });
      showToast('⚠️', 'Erro ao testar conexão.');
    } finally {
      setIsTestingKey(false);
    }
  };

  // If the user is an ALUNO, render ONLY the personal profile editor (no admin capabilities)
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D134C]/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-[#0D134C] text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <UserIcon className="w-5 h-5 text-[#AFE8D0]" />
              </div>
              <div>
                <h2 className="text-base font-extrabold font-['Nunito'] tracking-wide">
                  Meu Perfil de Estudante
                </h2>
                <p className="text-xs text-white/60">
                  Seus dados e credenciais de acesso individuais.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveStudentProfile} className="p-6 space-y-4">
            {/* Identity Card */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm"
                  style={{ backgroundColor: studentColor }}
                >
                  {studentName ? studentName.slice(0, 2).toUpperCase() : 'AL'}
                </div>
                <div>
                  <div className="text-xs font-mono text-gray-500">
                    Login: <strong className="text-[#0D134C]">@{currentUser?.username}</strong>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    ID de Usuário: {currentUser?.id}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                <Lock className="w-3 h-3 text-blue-600" />
                <span>Perfil Aluno</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Nome Completo:
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Seu nome"
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0D134C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Senha de Acesso:
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0D134C]"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Você pode alterar sua senha a qualquer momento para manter seus estudos protegidos.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Cor do Avatar:
              </label>
              <div className="flex gap-2">
                {AVATAR_COLORS.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setStudentColor(cor)}
                    className={`w-7 h-7 rounded-full transition cursor-pointer ${
                      studentColor === cor
                        ? 'ring-2 ring-offset-2 ring-[#0D134C] scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              {onOpenLogin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:text-red-600 hover:bg-gray-50 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Trocar de Conta</span>
                </button>
              )}

              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D134C] hover:bg-[#1a2060] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#BAFF38]" />
                  <span>Salvar Meu Perfil</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ADMIN VIEW: Full User Management & Gemini API Settings Panel
  return (
    <div className="fixed inset-0 z-50 bg-[#0D134C]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0D134C] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
              <Shield className="w-5 h-5 text-[#BAFF38]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold font-['Nunito'] tracking-wide">
                  Painel do Administrador
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-200 border border-red-400/30">
                  Acesso Total
                </span>
              </div>
              <p className="text-xs text-white/60">
                Gerencie usuários, senhas de acesso e chave de Inteligência Artificial Gemini.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('lista')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'lista'
                ? 'border-[#0D134C] text-[#0D134C]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuários ({users.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('novo');
              setFormError(null);
            }}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'novo'
                ? 'border-[#0D134C] text-[#0D134C]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#C8102E]" />
            <span>Criar Usuário</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('gemini');
              fetchGeminiStatus();
            }}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'gemini'
                ? 'border-[#0D134C] text-[#0D134C]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>Chave Gemini &amp; IA</span>
            {geminiStatus?.hasKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-0.5" />
            )}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'lista' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
                <span>Contas ativas no sistema:</span>
                <span className="font-bold text-[#0D134C]">
                  Logado como: <strong>{currentUser?.name}</strong>
                </span>
              </div>

              {users.map((user) => {
                const isCurrent = currentUser?.id === user.id;
                const isEditing = editingUserId === user.id;
                const isConfirmingDelete = confirmDeleteId === user.id;

                if (isEditing) {
                  return (
                    <div
                      key={user.id}
                      className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3"
                    >
                      <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        <span>Editando dados de: @{user.username}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                            Nome Completo
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                            Nova Senha
                          </label>
                          <input
                            type="text"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                            Perfil
                          </label>
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as any)}
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold"
                          >
                            <option value="aluno">Aluno / Estudante</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingUserId(null)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-100"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(user.id)}
                          className="px-4 py-1.5 bg-[#0D134C] text-white rounded-lg text-xs font-bold shadow-xs hover:bg-[#1a2060]"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={user.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                      isCurrent
                        ? 'bg-red-50/30 border-[#C8102E]/40 ring-1 ring-[#C8102E]/20'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs"
                        style={{ backgroundColor: user.color || '#0D134C' }}
                      >
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#0D134C] font-['Nunito']">
                            {user.name}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            @{user.username}
                          </span>
                          {user.role === 'admin' ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700">
                              Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                              Aluno
                            </span>
                          )}
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#dcfce7] text-[#15803d]">
                              Conectado
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-3">
                          <span>
                            Senha: <strong className="font-mono text-gray-600">{user.password}</strong>
                          </span>
                          <span>&bull;</span>
                          <span>Criado em: {user.createdAt || '2026-01-01'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {!isCurrent && (
                        <button
                          onClick={() => handleSwitchUser(user.id, user.name)}
                          className="px-3 py-1.5 rounded-lg bg-[#0D134C] hover:bg-[#1a2060] text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                          title="Alternar sessão para este usuário"
                        >
                          <LogIn className="w-3.5 h-3.5 text-[#BAFF38]" />
                          <span>Entrar</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleStartEdit(user)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#0D134C] hover:bg-gray-100 transition cursor-pointer"
                        title="Editar nome ou senha"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {users.length > 1 && !isCurrent && (
                        <>
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-1 rounded-lg animate-in fade-in">
                              <span className="text-[10px] font-bold text-red-800">Excluir?</span>
                              <button
                                onClick={() => executeDelete(user.id, user.username)}
                                className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-black cursor-pointer"
                              >
                                Sim
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-0.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-[10px] cursor-pointer"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingUserId(null);
                                setConfirmDeleteId(user.id);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Excluir usuário"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'novo' && (
            /* Formulário de Novo Usuário (Admin Only) */
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Cada novo usuário terá seu próprio painel independente. Os editais, progresso, histórico do cronômetro e cronogramas de IA serão criados exclusivamente para ele.
                </span>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nome Completo do Aluno / Usuário:
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Lucas Medeiros"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0D134C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Login / Usuário (sem espaços):
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().trim())}
                    placeholder="Ex: lucas"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0D134C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Senha de Acesso:
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ex: 123456"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0D134C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Perfil de Permissão:
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0D134C]"
                  >
                    <option value="aluno">Aluno / Estudante (Acesso completo aos estudos)</option>
                    <option value="admin">Administrador (Gestão de usuários e estudos)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Cor do Avatar:
                </label>
                <div className="flex gap-2">
                  {AVATAR_COLORS.map((cor) => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setNewColor(cor)}
                      className={`w-7 h-7 rounded-full transition cursor-pointer ${
                        newColor === cor ? 'ring-2 ring-offset-2 ring-[#0D134C] scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('lista')}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0D134C] hover:bg-[#1a2060] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-[#BAFF38]" />
                  <span>Cadastrar Usuário</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'gemini' && (
            /* Configuração da Chave do Gemini (Admin Only) */
            <div className="space-y-5">
              {/* Status Card */}
              <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      geminiStatus?.hasKey
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#0D134C] flex items-center gap-2">
                      <span>Status da Inteligência Artificial:</span>
                      {geminiStatus?.hasKey ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          Chave Ativa
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                          Não Configurada
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>
                        Origem:{' '}
                        <strong>
                          {geminiStatus?.source === 'custom'
                            ? 'Personalizada (Painel Admin)'
                            : geminiStatus?.source === 'environment'
                            ? 'Variável de Ambiente (Servidor)'
                            : 'Nenhuma'}
                        </strong>
                      </span>
                      {geminiStatus?.maskedKey && (
                        <>
                          <span>&bull;</span>
                          <span className="font-mono text-gray-600 bg-gray-200/70 px-1.5 py-0.5 rounded">
                            {geminiStatus.maskedKey}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={handleTestGemini}
                    disabled={isTestingKey}
                    className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingKey ? 'animate-spin' : ''}`} />
                    <span>{isTestingKey ? 'Testando...' : 'Testar Conexão'}</span>
                  </button>

                  {geminiStatus?.isCustom && (
                    <button
                      type="button"
                      onClick={handleResetGeminiKey}
                      disabled={isSavingKey}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                      title="Voltar a usar a chave padrão configurada no ambiente do servidor"
                    >
                      Restaurar Padrão
                    </button>
                  )}
                </div>
              </div>

              {/* Test Result Alert */}
              {testResponse && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                    testResponse.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {testResponse.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-extrabold">{testResponse.message}</div>
                    {testResponse.response && (
                      <div className="text-[11px] font-mono mt-1 opacity-80">
                        Resposta do modelo: &quot;{testResponse.response}&quot;
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form to set API Key */}
              <form onSubmit={handleSaveGeminiKey} className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-700" />
                  <span className="text-xs font-extrabold text-[#0D134C] uppercase tracking-wider">
                    Atualizar Chave do Google Gemini
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Cole sua Chave de API (Começa com AIza...):
                  </label>
                  <div className="relative">
                    <input
                      type={showKeyPassword ? 'text' : 'password'}
                      value={inputApiKey}
                      onChange={(e) => setInputApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-purple-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeyPassword(!showKeyPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      {showKeyPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-gray-400">
                    A chave fica salva de forma segura no servidor Node.js.
                  </span>
                  <button
                    type="submit"
                    disabled={isSavingKey || !inputApiKey.trim()}
                    className="px-4 py-2 bg-[#0D134C] hover:bg-[#1a2060] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#BAFF38]" />
                    <span>{isSavingKey ? 'Salvando...' : 'Salvar Nova Chave'}</span>
                  </button>
                </div>
              </form>

              {/* Instructions */}
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-950 space-y-2">
                <div className="font-extrabold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  <span>Como obter uma chave gratuita do Gemini:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-purple-900/80">
                  Você pode gerar uma chave de API gratuita diretamente pelo Google AI Studio em menos de 1 minuto, sem necessidade de cartão de crédito:
                </p>
                <div className="pt-1">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 hover:text-purple-950 underline cursor-pointer"
                  >
                    <span>Abrir Google AI Studio (Get API Key)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
