import React, { useState } from 'react';
import { useConcurso } from './context/ConcursoContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConcursoProvider } from './context/ConcursoContext';
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
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  Menu,
  Clock,
  Layers,
  Calendar,
  History,
  BarChart2,
  Target,
  Sparkles,
  Building2,
  FolderSync,
  LogOut,
  User as UserIcon,
  Shield,
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { activeConcurso, toast, showToast } = useConcurso();
  const { currentUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('estudos');
  const [isConcursoModalOpen, setIsConcursoModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-gray-200 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {activeConcurso.nome}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-xs font-semibold text-[#C8102E] bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  {activeConcurso.cargo}
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-black font-['Nunito'] text-[#0D134C] tracking-tight">
                {pageTitles[activeTab] || 'Gran Edital'}
              </h1>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2">
            {/* User Badge / Profile Switcher */}
            {currentUser && (
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-gray-100 text-xs font-bold text-gray-800 transition cursor-pointer"
                title={currentUser.role === 'admin' ? 'Painel Admin & Usuários' : 'Meu Perfil'}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0"
                  style={{ backgroundColor: currentUser.color || '#0D134C' }}
                >
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-bold max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                {currentUser.role === 'admin' && (
                  <span className="hidden md:inline text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-black uppercase">
                    Admin
                  </span>
                )}
              </button>
            )}

            {/* Trocar Concurso */}
            <button
              onClick={() => setIsConcursoModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#0D134C] hover:text-[#0D134C] transition cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-gray-500" />
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
              onClick={() => setIsBackupModalOpen(true)}
              className="p-1.5 rounded-xl text-gray-500 hover:text-[#0D134C] hover:bg-gray-100 transition cursor-pointer"
              title="Backup e Sincronização em Nuvem"
            >
              <FolderSync className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        </header>

        {/* View Content Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-16">
          {(activeTab === 'estudos' || activeTab === 'metas') && (
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
              targetDiscId={targetDiscId}
              onStartTopicStudy={(discNome, topico) =>
                handleStartStudySession(discNome, 'Teoria', topico)
              }
            />
          )}

          {activeTab === 'revisoes' && <RevisoesView />}

          {activeTab === 'historico' && <HistoricoView />}

          {activeTab === 'estatisticas' && <EstatisticasView />}
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
        isOpen={isLoginModalOpen}
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

const MainRouter: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginPage />;
  }

  return <DashboardLayout />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ConcursoProvider>
          <MainRouter />
        </ConcursoProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
