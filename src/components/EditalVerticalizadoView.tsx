import React, { useState, useMemo } from 'react';
import { useConcurso } from '../context/ConcursoContext';
import { DISC_CORES } from '../data/defaultConcursos';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  CheckSquare,
  HelpCircle,
} from 'lucide-react';

interface EditalVerticalizadoViewProps {
  onStartTopicStudy: (discNome: string, topico: string) => void;
  targetDiscId?: string | null;
}

export const EditalVerticalizadoView: React.FC<EditalVerticalizadoViewProps> = ({
  onStartTopicStudy,
  targetDiscId,
}) => {
  const { activeConcurso, progress, toggleTopic, updateTopicQuestions } = useConcurso();

  const [filterType, setFilterType] = useState<'todos' | 'pendentes' | 'concluidos' | 'questoes'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDiscs, setOpenDiscs] = useState<Record<string, boolean>>(() => {
    // Open all by default or target
    const map: Record<string, boolean> = {};
    activeConcurso.disciplinas.forEach(d => {
      map[d.id] = true;
    });
    return map;
  });

  const toggleDiscOpen = (id: string) => {
    setOpenDiscs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const map: Record<string, boolean> = {};
    activeConcurso.disciplinas.forEach(d => {
      map[d.id] = true;
    });
    setOpenDiscs(map);
  };

  const collapseAll = () => {
    setOpenDiscs({});
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Pesquisar qualquer assunto no edital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0D134C] transition"
          />
        </div>

        {/* Filters and Expand/Collapse */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setFilterType('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'todos' ? 'bg-white text-[#0D134C] shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('pendentes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'pendentes' ? 'bg-white text-[#0D134C] shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              ⬜ Pendentes
            </button>
            <button
              onClick={() => setFilterType('concluidos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'concluidos' ? 'bg-white text-[#0D134C] shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              ✅ Concluídos
            </button>
            <button
              onClick={() => setFilterType('questoes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'questoes' ? 'bg-white text-[#0D134C] shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              📊 Com Questões
            </button>
          </div>

          <div className="flex gap-1">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
              title="Expandir todas"
            >
              ↕ Expandir
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
              title="Recolher todas"
            >
              ↕ Recolher
            </button>
          </div>
        </div>
      </div>

      {/* Disciplines Accordion */}
      <div className="space-y-4">
        {activeConcurso.disciplinas.map((disc, di) => {
          const cor = DISC_CORES[di % DISC_CORES.length];
          const isOpen = openDiscs[disc.id] ?? true;

          // Calculate stats for this discipline
          let totalTopicos = 0;
          let concTopicos = 0;
          let totalAc = 0;
          let totalEr = 0;

          disc.grupos.forEach(g => {
            g.topicos.forEach((_, ti) => {
              totalTopicos++;
              const tid = `${disc.id}_${slugify(g.nome)}_${ti}`;
              const p = progress[tid];
              if (p?.done) concTopicos++;
              totalAc += p?.acertos || 0;
              totalEr += p?.erros || 0;
            });
          });

          const totalQ = totalAc + totalEr;
          const pctAcerto = totalQ > 0 ? Math.round((totalAc / totalQ) * 100) : null;
          const pctProgress = totalTopicos > 0 ? Math.round((concTopicos / totalTopicos) * 100) : 0;

          return (
            <div
              key={disc.id}
              id={`disc-${disc.id}`}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs transition"
            >
              {/* Discipline Header */}
              <div
                onClick={() => toggleDiscOpen(disc.id)}
                className="p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/80 transition select-none border-l-6"
                style={{ borderLeftColor: cor }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cor }} />
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm md:text-base text-[#0D134C] font-['Nunito'] truncate">
                      {disc.nome}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span>
                        {concTopicos} de {totalTopicos} tópicos concluídos
                      </span>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pctProgress}%`, backgroundColor: cor }}
                        />
                      </div>
                      <span className="font-bold text-gray-600">{pctProgress}%</span>
                    </div>
                  </div>
                </div>

                {/* Header Stats */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="text-center min-w-10">
                      <div className="text-sm font-extrabold text-emerald-600 font-['Nunito'] leading-none">
                        {totalAc}
                      </div>
                      <div className="text-[9px] font-bold uppercase text-gray-400 mt-0.5">Acertos</div>
                    </div>
                    <div className="text-center min-w-10">
                      <div className="text-sm font-extrabold text-red-600 font-['Nunito'] leading-none">
                        {totalEr}
                      </div>
                      <div className="text-[9px] font-bold uppercase text-gray-400 mt-0.5">Erros</div>
                    </div>
                    <div className="text-center min-w-10">
                      <div className="text-sm font-extrabold text-gray-700 font-['Nunito'] leading-none">
                        {totalQ}
                      </div>
                      <div className="text-[9px] font-bold uppercase text-gray-400 mt-0.5">Total</div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-black font-['Nunito'] ${
                      pctAcerto === null
                        ? 'bg-gray-100 text-gray-400'
                        : pctAcerto >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : pctAcerto >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pctAcerto !== null ? `${pctAcerto}%` : 'Sem questões'}
                  </span>

                  <div className="text-gray-400 pl-1">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Discipline Body */}
              {isOpen && (
                <div className="border-t border-gray-100 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-200">
                        <th className="py-2.5 px-4 text-center w-12">✓</th>
                        <th className="py-2.5 px-4">Tópico / Conteúdo Programático</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">Concluído Em</th>
                        <th className="py-2.5 px-4 text-center whitespace-nowrap">Questões (Acertos × Erros)</th>
                        <th className="py-2.5 px-4 text-center">Total</th>
                        <th className="py-2.5 px-4 text-center">% Acerto</th>
                        <th className="py-2.5 px-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disc.grupos.map((grupo, gi) => {
                        // Filter topics inside group
                        const matchingTopics = grupo.topicos.map((topico, ti) => {
                          const tid = `${disc.id}_${slugify(grupo.nome)}_${ti}`;
                          const p = progress[tid] || { done: false, acertos: 0, erros: 0, questoes: 0 };
                          return { topico, tid, ti, p };
                        }).filter(({ topico, p }) => {
                          // Search query filter
                          if (
                            searchQuery.trim().length > 0 &&
                            !topico.toLowerCase().includes(searchQuery.toLowerCase())
                          ) {
                            return false;
                          }
                          // Type filter
                          if (filterType === 'pendentes') return !p.done;
                          if (filterType === 'concluidos') return p.done;
                          if (filterType === 'questoes') return (p.acertos || 0) + (p.erros || 0) > 0;
                          return true;
                        });

                        if (matchingTopics.length === 0) return null;

                        return (
                          <React.Fragment key={gi}>
                            {/* Group subheader */}
                            <tr className="bg-gray-100/70 border-y border-gray-200">
                              <td
                                colSpan={7}
                                className="py-2 px-4 text-[11px] font-extrabold text-gray-700 tracking-wide uppercase border-l-4"
                                style={{ borderLeftColor: cor }}
                              >
                                {grupo.nome}
                              </td>
                            </tr>

                            {/* Topics */}
                            {matchingTopics.map(({ topico, tid, p }) => {
                              const ac = p.acertos || 0;
                              const er = p.erros || 0;
                              const tot = ac + er;
                              const pct = tot > 0 ? Math.round((ac / tot) * 100) : null;

                              return (
                                <tr
                                  key={tid}
                                  className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                                    p.done ? 'bg-emerald-50/20' : ''
                                  }`}
                                >
                                  {/* Checkbox */}
                                  <td className="py-3 px-4 text-center">
                                    <input
                                      type="checkbox"
                                      checked={p.done}
                                      onChange={() => toggleTopic(tid)}
                                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                  </td>

                                  {/* Topic Name */}
                                  <td className="py-3 px-4 min-w-[240px]">
                                    <div className={`font-medium ${p.done ? 'text-gray-800' : 'text-gray-900'}`}>
                                      {topico}
                                    </div>
                                    {p.done && p.datetime && (
                                      <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
                                        ✓ Concluído em {p.datetime}
                                      </div>
                                    )}
                                  </td>

                                  {/* Concluído em */}
                                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap text-[11px]">
                                    {p.done && p.datetime ? p.datetime : '—'}
                                  </td>

                                  {/* Questões Acertos x Erros */}
                                  <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-bold uppercase text-emerald-700">Acertos</span>
                                        <input
                                          type="number"
                                          min={0}
                                          value={p.acertos || ''}
                                          placeholder="0"
                                          onChange={(e) =>
                                            updateTopicQuestions(tid, parseInt(e.target.value) || 0, p.erros || 0)
                                          }
                                          className="w-12 p-1 text-center font-extrabold text-xs text-emerald-800 bg-white border border-gray-200 rounded-md focus:border-[#0D134C] focus:outline-none"
                                        />
                                      </div>
                                      <span className="text-gray-300 font-bold mt-3">×</span>
                                      <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-bold uppercase text-red-600">Erros</span>
                                        <input
                                          type="number"
                                          min={0}
                                          value={p.erros || ''}
                                          placeholder="0"
                                          onChange={(e) =>
                                            updateTopicQuestions(tid, p.acertos || 0, parseInt(e.target.value) || 0)
                                          }
                                          className="w-12 p-1 text-center font-extrabold text-xs text-red-800 bg-white border border-gray-200 rounded-md focus:border-[#0D134C] focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                  </td>

                                  {/* Total */}
                                  <td className="py-3 px-4 text-center font-extrabold text-gray-700">
                                    {tot > 0 ? tot : '—'}
                                  </td>

                                  {/* % Aproveitamento */}
                                  <td className="py-3 px-4 text-center">
                                    {pct !== null ? (
                                      <span
                                        className={`px-2 py-0.5 rounded-full font-extrabold text-[11px] ${
                                          pct >= 75
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : pct >= 50
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                      >
                                        {pct}%
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </td>

                                  {/* Ação: Estudar no Cronômetro */}
                                  <td className="py-3 px-4 text-center whitespace-nowrap">
                                    <button
                                      onClick={() => onStartTopicStudy(disc.nome, topico)}
                                      className="px-2 py-1 rounded-md bg-gray-100 hover:bg-[#0D134C] hover:text-white text-gray-700 text-[10px] font-bold transition flex items-center gap-1 mx-auto"
                                      title="Iniciar cronômetro com este assunto"
                                    >
                                      <Clock className="w-3 h-3" />
                                      <span>Estudar</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}
