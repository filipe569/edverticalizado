import React, { useMemo } from 'react';
import { useConcurso } from '../context/ConcursoContext';
import { DISC_CORES } from '../data/defaultConcursos';
import {
  RotateCcw,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const RevisoesView: React.FC = () => {
  const { activeConcurso, revisoes, toggleRevisaoDone, deleteRevisao } = useConcurso();

  const activeRevisoes = useMemo(() => {
    return revisoes.filter(r => r.concursoId === activeConcurso.id);
  }, [revisoes, activeConcurso.id]);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Classify reviews
  const categorized = useMemo(() => {
    const overdue: typeof activeRevisoes = [];
    const today: typeof activeRevisoes = [];
    const thisWeek: typeof activeRevisoes = [];
    const later: typeof activeRevisoes = [];
    const done: typeof activeRevisoes = [];

    activeRevisoes.forEach(r => {
      if (r.done) {
        done.push(r);
        return;
      }

      const diffDays = Math.ceil(
        (new Date(r.revDate + 'T00:00:00').getTime() - new Date(todayStr + 'T00:00:00').getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (diffDays < 0) {
        overdue.push(r);
      } else if (diffDays === 0) {
        today.push(r);
      } else if (diffDays <= 7) {
        thisWeek.push(r);
      } else {
        later.push(r);
      }
    });

    return [
      { key: 'overdue', title: 'Atrasadas', icon: '🔴', items: overdue, color: 'text-red-700 bg-red-50 border-red-200' },
      { key: 'today', title: 'Revisar Hoje', icon: '🟡', items: today, color: 'text-amber-800 bg-amber-50 border-amber-200' },
      { key: 'thisWeek', title: 'Esta Semana', icon: '🔵', items: thisWeek, color: 'text-blue-800 bg-blue-50 border-blue-200' },
      { key: 'later', title: 'Próximas', icon: '⚪', items: later, color: 'text-gray-700 bg-gray-50 border-gray-200' },
      { key: 'done', title: 'Concluídas', icon: '🟢', items: done, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
    ];
  }, [activeRevisoes, todayStr]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-5 h-5 text-[#C8102E]" />
            <h2 className="text-base font-extrabold text-[#0D134C] font-['Nunito'] uppercase tracking-wider">
              Cronograma de Revisões Espaçadas
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-semibold">
            {activeRevisoes.filter(r => !r.done).length} pendentes &bull; {activeRevisoes.filter(r => r.done).length} concluídas
          </span>
        </div>

        <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <span>
            As revisões são agendadas automaticamente quando você estuda no cronômetro e marca 7, 15, 21 ou 30 dias. Conclua uma revisão clicando no botão para manter seu índice de retenção cerebral elevado!
          </span>
        </div>

        {activeRevisoes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            Nenhuma revisão agendada para este concurso ainda.<br />
            Utilize o cronômetro na aba <strong>Estudos</strong> para agendar revisões automaticamente ao concluir um assunto.
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {categorized.map(cat => {
              if (cat.items.length === 0) return null;

              return (
                <div key={cat.key} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-700">
                    <span>{cat.icon}</span>
                    <span>{cat.title} ({cat.items.length})</span>
                  </div>

                  <div className="space-y-2">
                    {cat.items.map(r => {
                      const discIdx = activeConcurso.disciplinas.findIndex(d => d.nome === r.disc);
                      const cor = discIdx >= 0 ? DISC_CORES[discIdx % DISC_CORES.length] : '#0D134C';

                      return (
                        <div
                          key={r.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                            r.done ? 'bg-gray-50/60 opacity-70' : 'bg-white hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: cor }} />
                            <div>
                              <div className="font-extrabold text-xs text-[#0D134C]">{r.disc}</div>
                              <div className="text-xs text-gray-700 mt-0.5 font-medium">{r.topic}</div>
                              <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                                <span>Estudado em: {r.studyDate?.split('-').reverse().join('/') || '—'}</span>
                                <span>&bull;</span>
                                <span>Ciclo: {r.days} dias</span>
                                <span>&bull;</span>
                                <span className="font-semibold text-gray-600">
                                  Data Alvo: {r.revDate?.split('-').reverse().join('/')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => toggleRevisaoDone(r.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                r.done
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{r.done ? 'Reabrir' : 'Marcar como Feita'}</span>
                            </button>

                            <button
                              onClick={() => deleteRevisao(r.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Excluir revisão"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
