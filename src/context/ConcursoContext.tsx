import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  Concurso,
  TopicProgress,
  HistoricoRegistro,
  RevisaoItem,
  AICronogramaResult,
} from '../types/concurso';
import { DEFAULT_CONCURSOS } from '../data/defaultConcursos';
import { useAuth } from './AuthContext';

interface ConcursoContextType {
  concursos: Concurso[];
  activeConcurso: Concurso;
  activeConcursoId: string;
  progress: Record<string, TopicProgress>;
  historico: HistoricoRegistro[];
  revisoes: RevisaoItem[];
  switchConcurso: (id: string) => void;
  createConcurso: (concurso: Concurso) => void;
  updateConcurso: (concurso: Concurso) => void;
  deleteConcurso: (id: string) => void;
  toggleTopic: (topicId: string) => void;
  updateTopicQuestions: (topicId: string, acertos: number, erros: number) => void;
  addHistorico: (reg: Omit<HistoricoRegistro, 'id' | 'concursoId'>) => void;
  deleteHistorico: (id: number) => void;
  addRevisao: (item: Omit<RevisaoItem, 'id' | 'concursoId'>) => void;
  toggleRevisaoDone: (id: string | number) => void;
  deleteRevisao: (id: string | number) => void;
  updateMetas: (metas: Partial<Concurso['metas']>) => void;
  setProficiencia: (discNome: string, nivel: 'iniciante' | 'intermediario' | 'avancado') => void;
  setProficienciasBatch: (map: Record<string, 'iniciante' | 'intermediario' | 'avancado'>) => void;
  saveAICronograma: (result: AICronogramaResult) => void;
  exportData: (onlyCurrent?: boolean) => void;
  importData: (jsonData: any) => boolean;
  toast: { icon: string; message: string } | null;
  showToast: (icon: string, message: string) => void;
}

const ConcursoContext = createContext<ConcursoContextType | undefined>(undefined);

export const ConcursoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'default_user';

  // Helper to load isolated user dataset from localStorage
  const loadUserData = (uId: string) => {
    try {
      const userConcursosKey = `gran_concursos_u_${uId}`;
      let rawConcursos = localStorage.getItem(userConcursosKey);

      // Migration fallback for initial admin
      if (!rawConcursos && (uId === 'user-admin-1' || uId === 'default_user')) {
        rawConcursos = localStorage.getItem('gran_concursos_v2');
      }

      const userConcursos: Concurso[] = rawConcursos ? JSON.parse(rawConcursos) : DEFAULT_CONCURSOS;

      const userActiveId =
        localStorage.getItem(`gran_active_id_u_${uId}`) ||
        (uId === 'user-admin-1' ? localStorage.getItem('gran_active_id_v2') : null) ||
        userConcursos[0]?.id ||
        DEFAULT_CONCURSOS[0].id;

      let rawProgress = localStorage.getItem(`gran_progress_u_${uId}`);
      if (!rawProgress && (uId === 'user-admin-1' || uId === 'default_user')) {
        rawProgress = localStorage.getItem('gran_progress_v2');
      }
      const userProgress = rawProgress ? JSON.parse(rawProgress) : {};

      let rawHistorico = localStorage.getItem(`gran_historico_u_${uId}`);
      if (!rawHistorico && (uId === 'user-admin-1' || uId === 'default_user')) {
        rawHistorico = localStorage.getItem('gran_historico_v2');
      }
      const userHistorico = rawHistorico ? JSON.parse(rawHistorico) : [];

      let rawRevisoes = localStorage.getItem(`gran_revisoes_u_${uId}`);
      if (!rawRevisoes && (uId === 'user-admin-1' || uId === 'default_user')) {
        rawRevisoes = localStorage.getItem('gran_revisoes_v2');
      }
      const userRevisoes = rawRevisoes ? JSON.parse(rawRevisoes) : [];

      return {
        concursos: userConcursos,
        activeConcursoId: userActiveId,
        progress: userProgress,
        historico: userHistorico,
        revisoes: userRevisoes,
      };
    } catch (e) {
      console.error('Erro ao carregar dados do usuário:', e);
      return {
        concursos: DEFAULT_CONCURSOS,
        activeConcursoId: DEFAULT_CONCURSOS[0].id,
        progress: {},
        historico: [],
        revisoes: [],
      };
    }
  };

  const initialData = useMemo(() => loadUserData(userId), [userId]);

  const [concursos, setConcursos] = useState<Concurso[]>(initialData.concursos);
  const [activeConcursoId, setActiveConcursoId] = useState<string>(initialData.activeConcursoId);
  const [progress, setProgress] = useState<Record<string, TopicProgress>>(initialData.progress);
  const [historico, setHistorico] = useState<HistoricoRegistro[]>(initialData.historico);
  const [revisoes, setRevisoes] = useState<RevisaoItem[]>(initialData.revisoes);

  // Reload state whenever active user changes
  const prevUserIdRef = useRef<string>(userId);
  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      prevUserIdRef.current = userId;
      const data = loadUserData(userId);
      setConcursos(data.concursos);
      setActiveConcursoId(data.activeConcursoId);
      setProgress(data.progress);
      setHistorico(data.historico);
      setRevisoes(data.revisoes);
    }
  }, [userId]);

  // Fetch remote user data from server on user switch / mount (Cross-browser sync)
  useEffect(() => {
    let isCancelled = false;

    fetch(`/api/db/user-data/${userId}`)
      .then((res) => res.json())
      .then((res) => {
        if (isCancelled) return;
        if (res.success && res.data) {
          const serverData = res.data;
          if (Array.isArray(serverData.concursos) && serverData.concursos.length > 0) {
            setConcursos(serverData.concursos);
          }
          if (serverData.activeConcursoId) {
            setActiveConcursoId(serverData.activeConcursoId);
          }
          if (serverData.progress && typeof serverData.progress === 'object') {
            setProgress(serverData.progress);
          }
          if (Array.isArray(serverData.historico)) {
            setHistorico(serverData.historico);
          }
          if (Array.isArray(serverData.revisoes)) {
            setRevisoes(serverData.revisoes);
          }
        }
      })
      .catch((e) => console.warn('Sync com servidor não disponível:', e));

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  const [toast, setToast] = useState<{ icon: string; message: string } | null>(null);

  const showToast = (icon: string, message: string) => {
    setToast({ icon, message });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3000);
  };

  // Sync state to user-scoped localStorage keys and server database (Cross-browser persistence)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(`gran_concursos_u_${userId}`, JSON.stringify(concursos));
      localStorage.setItem(`gran_active_id_u_${userId}`, activeConcursoId);
      localStorage.setItem(`gran_progress_u_${userId}`, JSON.stringify(progress));
      localStorage.setItem(`gran_historico_u_${userId}`, JSON.stringify(historico));
      localStorage.setItem(`gran_revisoes_u_${userId}`, JSON.stringify(revisoes));

      // Debounce sync to server
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        fetch(`/api/db/user-data/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            concursos,
            activeConcursoId,
            progress,
            historico,
            revisoes,
          }),
        }).catch((e) => console.warn('Erro silencioso ao sincronizar dados com o servidor:', e));
      }, 500);
    } catch (e) {}
  }, [concursos, activeConcursoId, progress, historico, revisoes, userId]);

  const activeConcurso = useMemo(() => {
    const found = concursos.find(c => c.id === activeConcursoId);
    return found || concursos[0] || DEFAULT_CONCURSOS[0];
  }, [concursos, activeConcursoId]);

  const switchConcurso = (id: string) => {
    if (concursos.some(c => c.id === id)) {
      setActiveConcursoId(id);
      showToast('🔄', `Concurso trocado para: ${concursos.find(c => c.id === id)?.nome}`);
    }
  };

  const createConcurso = (novo: Concurso) => {
    setConcursos(prev => [...prev, novo]);
    setActiveConcursoId(novo.id);
    showToast('✨', `Novo edital criado: ${novo.nome}`);
  };

  const updateConcurso = (atualizado: Concurso) => {
    setConcursos(prev => prev.map(c => (c.id === atualizado.id ? atualizado : c)));
    showToast('💾', 'Edital atualizado com sucesso!');
  };

  const deleteConcurso = (id: string) => {
    if (concursos.length <= 1) {
      showToast('⚠️', 'Você precisa ter pelo menos um concurso cadastrado.');
      return;
    }
    const filtered = concursos.filter(c => c.id !== id);
    setConcursos(filtered);
    if (activeConcursoId === id) {
      setActiveConcursoId(filtered[0].id);
    }
    showToast('🗑️', 'Concurso removido.');
  };

  const toggleTopic = (topicId: string) => {
    const current = progress[topicId] || { done: false, acertos: 0, erros: 0, questoes: 0 };
    const nextDone = !current.done;
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    
    setProgress(prev => ({
      ...prev,
      [topicId]: {
        ...current,
        done: nextDone,
        datetime: nextDone ? formattedDate : null,
      },
    }));
  };

  const updateTopicQuestions = (topicId: string, acertos: number, erros: number) => {
    const current = progress[topicId] || { done: false, acertos: 0, erros: 0, questoes: 0 };
    const validAc = Math.max(0, acertos || 0);
    const validEr = Math.max(0, erros || 0);
    const total = validAc + validEr;
    
    setProgress(prev => ({
      ...prev,
      [topicId]: {
        ...current,
        acertos: validAc,
        erros: validEr,
        questoes: total,
      },
    }));
  };

  const addHistorico = (reg: Omit<HistoricoRegistro, 'id' | 'concursoId'>) => {
    const newReg: HistoricoRegistro = {
      ...reg,
      id: Date.now() + Math.random(),
      concursoId: activeConcursoId,
    };
    setHistorico(prev => [newReg, ...prev]);
  };

  const deleteHistorico = (id: number) => {
    setHistorico(prev => prev.filter(h => h.id !== id));
    showToast('🗑️', 'Registro removido do histórico.');
  };

  const addRevisao = (item: Omit<RevisaoItem, 'id' | 'concursoId'>) => {
    const newRev: RevisaoItem = {
      ...item,
      id: Date.now() + Math.random(),
      concursoId: activeConcursoId,
    };
    setRevisoes(prev => [...prev, newRev]);
  };

  const toggleRevisaoDone = (id: string | number) => {
    setRevisoes(prev =>
      prev.map(r => (String(r.id) === String(id) ? { ...r, done: !r.done } : r))
    );
  };

  const deleteRevisao = (id: string | number) => {
    setRevisoes(prev => prev.filter(r => String(r.id) !== String(id)));
    showToast('🗑️', 'Revisão removida.');
  };

  const updateMetas = (metasUpdate: Partial<Concurso['metas']>) => {
    setConcursos(prev =>
      prev.map(c => {
        if (c.id === activeConcursoId) {
          return {
            ...c,
            metas: { ...c.metas, ...metasUpdate },
          };
        }
        return c;
      })
    );
    showToast('🎯', 'Metas atualizadas!');
  };

  const setProficiencia = (discNome: string, nivel: 'iniciante' | 'intermediario' | 'avancado') => {
    setConcursos(prev =>
      prev.map(c => {
        if (c.id === activeConcursoId) {
          return {
            ...c,
            proficiencias: {
              ...(c.proficiencias || {}),
              [discNome]: nivel,
            },
          };
        }
        return c;
      })
    );
  };

  const setProficienciasBatch = (map: Record<string, 'iniciante' | 'intermediario' | 'avancado'>) => {
    setConcursos(prev =>
      prev.map(c => {
        if (c.id === activeConcursoId) {
          return {
            ...c,
            proficiencias: {
              ...(c.proficiencias || {}),
              ...map,
            },
          };
        }
        return c;
      })
    );
  };

  const saveAICronograma = (result: AICronogramaResult) => {
    const enriched: AICronogramaResult = {
      ...result,
      geradoEm: new Date().toISOString(),
    };
    setConcursos(prev =>
      prev.map(c => {
        if (c.id === activeConcursoId) {
          return {
            ...c,
            cronogramaIA: enriched,
            metas: {
              ...c.metas,
              horasSemana: enriched.metasSugeridas?.horasSemanais || c.metas.horasSemana,
              questoesSemana: enriched.metasSugeridas?.questoesSemana || c.metas.questoesSemana,
              aproveitamento: enriched.metasSugeridas?.aproveitamentoMinimoDesejado || c.metas.aproveitamento,
            },
          };
        }
        return c;
      })
    );
    showToast('🤖', 'Cronograma semanal e categorias personalizadas salvas!');
  };

  const exportData = (onlyCurrent = false) => {
    try {
      const dataToExport = {
        exportedAt: new Date().toISOString(),
        version: '2.0',
        activeConcursoId,
        concursos: onlyCurrent ? concursos.filter(c => c.id === activeConcursoId) : concursos,
        progress,
        historico: onlyCurrent ? historico.filter(h => h.concursoId === activeConcursoId) : historico,
        revisoes: onlyCurrent ? revisoes.filter(r => r.concursoId === activeConcursoId) : revisoes,
      };

      const jsonStr = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = onlyCurrent
        ? `backup-${activeConcurso.id}-${new Date().toISOString().slice(0, 10)}.json`
        : `backup-completo-editais-${new Date().toISOString().slice(0, 10)}.json`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('💾', 'Backup exportado com sucesso!');
    } catch (e: any) {
      showToast('⚠️', `Erro ao exportar: ${e.message}`);
    }
  };

  const importData = (jsonData: any): boolean => {
    try {
      if (!jsonData) return false;

      // Handle legacy format from HTML version
      if (jsonData.state && !jsonData.concursos) {
        const legacyProgress: Record<string, TopicProgress> = {};
        Object.keys(jsonData.state).forEach(tid => {
          const s = jsonData.state[tid];
          legacyProgress[tid] = {
            done: !!s.done,
            datetime: s.datetime || null,
            acertos: s.acertos || 0,
            erros: s.erros || 0,
            questoes: s.questoes || (s.acertos || 0) + (s.erros || 0),
          };
        });

        const legacyHist = (jsonData.historico || []).map((h: any) => ({
          ...h,
          concursoId: 'gran-prefeitura-de-salvador-ba',
        }));

        const legacyRev = (jsonData.revisoes || []).map((r: any) => ({
          ...r,
          concursoId: 'gran-prefeitura-de-salvador-ba',
        }));

        setProgress(prev => ({ ...prev, ...legacyProgress }));
        setHistorico(prev => [...legacyHist, ...prev]);
        setRevisoes(prev => [...legacyRev, ...prev]);
        showToast('✅', 'Backup legado da Salvador GCM restaurado!');
        return true;
      }

      // Handle version 2 format
      if (jsonData.concursos && Array.isArray(jsonData.concursos)) {
        // Merge concursos by id
        setConcursos(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const updated = [...prev];
          jsonData.concursos.forEach((c: Concurso) => {
            const idx = updated.findIndex(x => x.id === c.id);
            if (idx >= 0) {
              updated[idx] = c;
            } else {
              updated.push(c);
            }
          });
          return updated;
        });

        if (jsonData.progress) {
          setProgress(prev => ({ ...prev, ...jsonData.progress }));
        }
        if (jsonData.historico && Array.isArray(jsonData.historico)) {
          setHistorico(jsonData.historico);
        }
        if (jsonData.revisoes && Array.isArray(jsonData.revisoes)) {
          setRevisoes(jsonData.revisoes);
        }
        if (jsonData.activeConcursoId) {
          setActiveConcursoId(jsonData.activeConcursoId);
        }
        showToast('✅', 'Backup importado com sucesso!');
        return true;
      }

      return false;
    } catch (e) {
      console.error(e);
      showToast('⚠️', 'Arquivo de backup inválido.');
      return false;
    }
  };

  return (
    <ConcursoContext.Provider
      value={{
        concursos,
        activeConcurso,
        activeConcursoId,
        progress,
        historico,
        revisoes,
        switchConcurso,
        createConcurso,
        updateConcurso,
        deleteConcurso,
        toggleTopic,
        updateTopicQuestions,
        addHistorico,
        deleteHistorico,
        addRevisao,
        toggleRevisaoDone,
        deleteRevisao,
        updateMetas,
        setProficiencia,
        setProficienciasBatch,
        saveAICronograma,
        exportData,
        importData,
        toast,
        showToast,
      }}
    >
      {children}
    </ConcursoContext.Provider>
  );
};

export const useConcurso = () => {
  const context = useContext(ConcursoContext);
  if (!context) {
    throw new Error('useConcurso deve ser usado dentro de um ConcursoProvider');
  }
  return context;
};
