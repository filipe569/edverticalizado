import React, { useState } from 'react';
import { useConcurso } from '../context/ConcursoContext';
import { useAuth } from '../context/AuthContext';
import { DISC_CORES } from '../data/defaultConcursos';
import {
  Clock,
  CheckSquare,
  Sparkles,
  RotateCcw,
  Calendar,
  BarChart3,
  Target,
  Plus,
  Settings2,
  Download,
  Upload,
  CalendarDays,
  Users,
  LogOut,
  UserCheck,
  Shield,
  User as UserIcon,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenConcursoManager: () => void;
  onOpenBackup: () => void;
  onGoToDiscipline: (discId: string) => void;
  onOpenUserManagement?: () => void;
  onOpenLogin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenConcursoManager,
  onOpenBackup,
  onGoToDiscipline,
  onOpenUserManagement,
  onOpenLogin,
}) => {
  const { concursos, activeConcurso, switchConcurso } = useConcurso();
  const { currentUser, logout } = useAuth();

  // Calculate days to exam
  const daysToExam = React.useMemo(() => {
    if (!activeConcurso.dataProva) return null;
    const examDate = new Date(activeConcurso.dataProva + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [activeConcurso.dataProva]);

  const navItems = [
    { id: 'estudos', label: 'Cronômetro & Estudos', icon: Clock },
    { id: 'ia-cronograma', label: 'IA: Leitor & Cronograma', icon: Sparkles, badge: 'IA' },
    { id: 'edital', label: 'Edital Verticalizado', icon: CheckSquare },
    { id: 'revisoes', label: 'Revisões Espaçadas', icon: RotateCcw },
    { id: 'historico', label: 'Histórico de Estudos', icon: CalendarDays },
    { id: 'estatisticas', label: 'Estatísticas & Análise', icon: BarChart3 },
    { id: 'metas', label: 'Metas de Estudo', icon: Target },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#0D134C] text-white flex flex-col fixed top-0 left-0 z-40 shadow-xl overflow-y-auto border-r border-white/10 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#C8102E] rounded-xl flex items-center justify-center font-black text-white text-base shadow-md">
            G
          </div>
          <div>
            <div className="font-extrabold text-sm leading-tight text-white font-['Nunito']">
              Gran Concursos
            </div>
            <div className="text-[10px] text-white/50 font-semibold tracking-wider uppercase">
              Edital Verticalizado
            </div>
          </div>
        </div>
      </div>

      {/* Concurso Switcher */}
      <div className="p-3.5 mx-3 mt-3 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold tracking-wider text-white/40 uppercase">
            Concurso Ativo
          </span>
          <button
            onClick={onOpenConcursoManager}
            className="text-[11px] text-[#AFE8D0] hover:text-[#BAFF38] font-bold flex items-center gap-1 transition"
            title="Trocar ou cadastrar outro concurso"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Gerenciar</span>
          </button>
        </div>

        <select
          value={activeConcurso.id}
          onChange={(e) => switchConcurso(e.target.value)}
          className="w-full bg-[#1a2060] text-white text-xs font-semibold rounded-lg px-2.5 py-2 border border-white/15 focus:outline-none focus:border-[#AFE8D0] transition truncate cursor-pointer"
        >
          {concursos.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#0D134C] text-white">
              {c.nome} {c.cargo ? `(${c.cargo})` : ''}
            </option>
          ))}
        </select>

        {/* Quick Concurso Details */}
        <div className="text-[11px] text-white/70 space-y-1 pt-1 border-t border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-white/40 text-[10px]">Cargo:</span>
            <span className="font-medium text-white truncate max-w-[140px]" title={activeConcurso.cargo}>
              {activeConcurso.cargo || '—'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/40 text-[10px]">Banca:</span>
            <span className="font-semibold text-[#EFBD7B]">{activeConcurso.banca || '—'}</span>
          </div>
        </div>
      </div>

      {/* Countdown Card */}
      {activeConcurso.dataProva && (
        <div className="mx-3 mt-2.5 p-3 rounded-xl bg-gradient-to-br from-[#C8102E] to-[#990b20] text-white flex items-center justify-between shadow-md">
          <div>
            <div className="text-[9px] font-bold tracking-wider uppercase text-white/80">
              Data da Prova
            </div>
            <div className="text-xs font-semibold text-white/90 mt-0.5">
              {new Date(activeConcurso.dataProva + 'T00:00:00').toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black font-['Nunito'] leading-none">
              {daysToExam !== null ? (daysToExam > 0 ? daysToExam : daysToExam === 0 ? 'Hoje!' : 'Passou') : '—'}
            </div>
            <div className="text-[9px] text-white/70 font-bold uppercase mt-0.5">dias restantes</div>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="p-3 flex-1 space-y-1">
        <div className="text-[9px] font-bold tracking-wider uppercase text-white/30 px-3 py-1 mt-2">
          Menu Principal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition ${
                isActive
                  ? 'bg-[#C8102E] text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black bg-[#BAFF38] text-[#0D134C]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Disciplines Direct Links */}
        <div className="pt-3">
          <div className="text-[9px] font-bold tracking-wider uppercase text-white/30 px-3 py-1">
            Disciplinas do Edital ({activeConcurso.disciplinas.length})
          </div>
          <div className="mt-1 space-y-0.5 max-h-48 overflow-y-auto pr-1">
            {activeConcurso.disciplinas.map((disc, idx) => {
              const cor = DISC_CORES[idx % DISC_CORES.length];
              return (
                <button
                  key={disc.id}
                  onClick={() => {
                    setActiveTab('edital');
                    onGoToDiscipline(disc.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] text-white/60 hover:text-white hover:bg-white/5 transition text-left group"
                  title={disc.nome}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: cor }}
                  />
                  <span className="truncate">{disc.nome}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Actions & User Card */}
      <div className="p-3 border-t border-white/10 bg-[#090d33] flex flex-col gap-2">
        {/* User Card */}
        {currentUser && (
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0"
                style={{ backgroundColor: currentUser.color || '#C8102E' }}
              >
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate font-['Nunito']">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-white/50 flex items-center gap-1.5">
                  <span className="font-mono">@{currentUser.username}</span>
                  <span>&bull;</span>
                  <span className="uppercase text-[#AFE8D0] font-black text-[9px]">{currentUser.role}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onOpenUserManagement && (
                <button
                  onClick={onOpenUserManagement}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title={currentUser.role === 'admin' ? 'Painel de Usuários (Admin)' : 'Meu Perfil'}
                >
                  {currentUser.role === 'admin' ? (
                    <Shield className="w-3.5 h-3.5 text-[#BAFF38]" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-white/80" />
                  )}
                </button>
              )}
              <button
                onClick={() => logout()}
                className="p-1.5 rounded-lg text-white/70 hover:text-red-400 hover:bg-white/10 transition cursor-pointer"
                title="Desconectar / Sair"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onOpenBackup}
          className="w-full py-1.5 px-3 rounded-lg border border-white/15 text-white/70 hover:text-white hover:bg-white/10 text-[11px] font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Backup &amp; Restauração</span>
        </button>
      </div>
    </aside>
  );
};
