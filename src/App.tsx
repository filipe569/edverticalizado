import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConcursoProvider, useConcurso } from './context/ConcursoContext';
import { Sidebar } from './components/Sidebar';
import { EstudosView } from './components/EstudosView';
import { AICronogramaView } from './components/AICronogramaView';
import { EditalVerticalizadoView } from './components/EditalVerticalizadoView';
import { RevisoesView } from './components/RevisoesView';
import { HistoricoView } from './components/HistoricoView';
import { EstatisticasView } from './components/EstatisticasView';
import { ConcursoManagerModal } from './components/ConcursoManagerModal';
import { BackupModal } from './components/BackupModal';
import { UserManagementModal } from './components/UserManagementModal';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';
import {
  Menu,
  Clock,
  Sparkles,
  CheckSquare,
  RotateCcw,
  CalendarDays,
  BarChart3,
  Target,
  Building2,
  Save,
  CheckCircle2,
  Users,
  LogOut,
  User as UserIcon,
  Shield,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeConcurso, toast, showToast } = useConcurso();
  const { currentUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('estudos');
  const [isConcursoModalOpen, setIsConcursoModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If no user is authenticated, render the dedicated full-screen login page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Prefill state for the Cronômetro
  const [cronoPrefill, setCronoPrefill] = useState<{
    discNome: string;
    tipoEstudo: string;
    topico?: string;
  } | null>(null);

  // Discipline targeted navigation
  const [targetDiscId, setTargetDiscId] = useState<string | null>(null);

  const handleStartStudySession = (discNome: string, tipoEstudo: string, topico?: string) => {
    setCronoPrefill({ discNome, tipoEstudo, topico });
    setActiveTab('estudos');
    showToast('⏱️', `Sessão carregada no cronômetro: ${discNome}`);
  };

  const handleGoToDiscipline = (discId: string) => {
    setTargetDiscId(discId);
    setActiveTab('edital');
    setTimeout(() => {
      const el = document.getElementById(`disc-${discId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const pageTitles: Record<string, string> = {
    estudos: 'Cronômetro & Painel de Estudos',
    'ia-cronograma': 'Inteligência Artificial: Leitor de Editais & Cronograma',
    edital: 'Edital Verticalizado',
    revisoes: 'Cronograma de Revisões Espaçadas',
    historico: 'Histórico de Estudos',
    estatisticas: 'Estatísticas & Análise de Desempenho',
    metas: 'Metas de Estudo',
  };

  return (
    <div className="min-h-screen bg-[#eef0f7] text-[#0D134C] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenConcursoManager={() => setIsConcursoModalOpen(true)}
          onOpenBackup={() => setIsBackupModalOpen(true)}
          onGoToDiscipline={handleGoToDiscipline}
          onOpenUserManagement={() => setIsUserModalOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#0D134C]/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[85vw] h-full">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileSidebarOpen(false);
              }}
              onOpenConcursoManager={() => {
                setIsConcursoModalOpen(true);
                setMobileSidebarOpen(false);
              }}
              onOpenBackup={() => {
                setIsBackupModalOpen(true);
                setMobileSidebarOpen(false);
              }}
              onGoToDiscipline={(discId) => {
                handleGoToDiscipline(discId);
                setMobileSidebarOpen(false);
              }}
              onOpenUserManagement={() => {
                setIsUserModalOpen(true);
                setMobileSidebarOpen(false);
              }}
              onOpenLogin={() => {
                setIsLoginModalOpen(true);
                setMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200/80 px-4 md:px-8 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
              title="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base md:text-lg font-black font-['Nunito'] text-[#0D134C] truncate">
                  {pageTitles[activeTab] || 'Edital Verticalizado'}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#C8102E]/10 text-[#C8102E] border border-[#C8102E]/20">
                  <Building2 className="w-3 h-3" />
                  <span className="truncate max-w-[160px]">{activeConcurso.nome}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* User Profile Pill */}
            {currentUser && (
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 hover:border-[#0D134C] hover:bg-gray-50 transition cursor-pointer text-left"
                title="Gestão de Usuários"
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-black shrink-0"
                  style={{ backgroundColor: currentUser.color || '#C8102E' }}
                >
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block leading-tight">
                  <div className="text-xs font-extrabold text-[#0D134C] flex items-center gap-1.5">
                    <span className="truncate max-w-[120px]">{currentUser.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider ${
                        currentUser.role === 'admin'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </button>
            )}

            {/* Painel de Usuários (Admin) ou Meu Perfil (Aluno) */}
            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50/50 text-xs font-bold text-red-900 hover:border-[#C8102E] hover:bg-red-50 transition cursor-pointer"
                title="Gerenciar usuários do sistema (Painel do Administrador)"
              >
                <Shield className="w-3.5 h-3.5 text-[#C8102E]" />
                <span>Painel Admin</span>
              </button>
            ) : (
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#0D134C] hover:text-[#0D134C] transition cursor-pointer"
                title="Ver e editar meus dados de acesso"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#0D134C]" />
                <span>Meu Perfil</span>
              </button>
            )}

            {/* Quick switcher concurso button */}
            <button
              onClick={() => setIsConcursoModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#0D134C] hover:text-[#0D134C] transition cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-[#C8102E]" />
              <span>Trocar Concurso</span>
            </button>

            {/* Sair / Logout */}
            <button
              onClick={() => {
                logout();
                showToast('👋', 'Sessão encerrada com sucesso.');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-red-400 hover:text-red-600 transition cursor-pointer"
              title="Desconectar e voltar para a tela de login"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden xs:inline">Sair</span>
            </button>

            {/* Save indicator button */}
            <button
              onClick={() => showToast('💾', 'Todos os dados salvos com sucesso!')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0D134C] hover:bg-[#1a2060] text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#AFE8D0]" />
              <span className="hidden xs:inline">Salvar</span>
            </button>
          </div>
        </header>

        {/* Tab Navigation Pill Strip */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-2 overflow-x-auto flex gap-1.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('estudos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'estudos'
                ? 'bg-[#0D134C] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>⏱ Estudos &amp; Cronômetro</span>
          </button>

          <button
            onClick={() => setActiveTab('ia-cronograma')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'ia-cronograma'
                ? 'bg-[#0D134C] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C8102E]" />
            <span>🤖 Cronograma Semanal IA</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-[#BAFF38] text-[#0D134C]">
              ADAPTATIVO
            </span>
          </button>

          <button
            onClick={() => setActiveTab('edital')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'edital'
                ? 'bg-[#0D134C] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>📋 Edital Verticalizado</span>
          </button>

          <button
            onClick={() => setActiveTab('revisoes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'revisoes'
                ? 'bg-[#0D134C] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>🔁 Revisões</span>
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'historico'
                ? 'bg-[#0D134C] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>📅 Histórico</span>
          </button>

          <button
            onClick={() => setActiveTab('estatisticas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'estatisticas'
                ? 'bg-[#0D134C] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>📊 Desempenho</span>
          </button>
        </div>

        {/* View Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'estudos' && (
            <EstudosView
              cronoPrefill={cronoPrefill}
              onClearCronoPrefill={() => setCronoPrefill(null)}
            />
          )}

          {activeTab === 'ia-cronograma' && (
            <AICronogramaView onStartStudySession={handleStartStudySession} />
          )}

          {activeTab === 'edital' && (
            <EditalVerticalizadoView
              onStartTopicStudy={(discNome, topico) =>
                handleStartStudySession(discNome, 'Teoria', topico)
              }
              targetDiscId={targetDiscId}
            />
          )}

          {activeTab === 'revisoes' && <RevisoesView />}

          {activeTab === 'historico' && <HistoricoView />}

          {activeTab === 'estatisticas' && <EstatisticasView />}

          {activeTab === 'metas' && (
            <EstudosView
              cronoPrefill={cronoPrefill}
              onClearCronoPrefill={() => setCronoPrefill(null)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ConcursoManagerModal
        isOpen={isConcursoModalOpen}
        onClose={() => setIsConcursoModalOpen(false)}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onOpenLogin={() => {
          setIsUserModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen || !currentUser}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenRegister={() => {
          setIsLoginModalOpen(false);
          setIsUserModalOpen(true);
        }}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0D134C] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
          <span className="text-base">{toast.icon}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ConcursoProvider>
        <AppContent />
      </ConcursoProvider>
    </AuthProvider>
  );
}
