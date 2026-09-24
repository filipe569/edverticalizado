import React, { useState, useMemo } from 'react';
import { useConcurso } from '../context/ConcursoContext';
import { DISC_CORES } from '../data/defaultConcursos';
import {
  CalendarDays,
  Trash2,
  Filter,
  Clock,
  CheckCircle,
  FileText,
} from 'lucide-react';

export const HistoricoView: React.FC = () => {
  const { activeConcurso, historico, deleteHistorico } = useConcurso();

  const [discFilter, setDiscFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState<number>(30); // 7, 30, 0 (all)

  // Filter history for current contest
  const filtered = useMemo(() => {
    const cutoffDate = periodFilter > 0 ? new Date(Date.now() - periodFilter * 86400000) : null;

    return historico
      .filter(r => {
        if (r.concursoId !== activeConcurso.id) return false;
        if (discFilter && r.disc !== discFilter) return false;
        if (cutoffDate && new Date(r.date + 'T00:00:00') < cutoffDate) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  }, [historico, activeConcurso.id, discFilter, periodFilter]);

  // Summaries
  const { totalHoras, totalQuestoes, uniqueDays, mediaDiaria } = useMemo(() => {
    const h = filtered.reduce((acc, r) => acc + (r.horas || 0), 0);
    const q = filtered.reduce((acc, r) => acc + (r.questoes || 0), 0);
    const days = new Set(filtered.map(r => r.date)).size;
    const media = days > 0 ? Math.round((h / days) * 10) / 10 : 0;

    return {
      totalHoras: Math.round(h * 10) / 10,
      totalQuestoes: q,
      uniqueDays: days,
      mediaDiaria: media,
    };
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-2xl font-black text-[#0D134C] font-['Nunito'] leading-none">
            {uniqueDays}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-2">
            Dias Estudados
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-2xl font-black text-emerald-600 font-['Nunito'] leading-none">
            {totalHoras}h
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-2">
            Total de Horas
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-2xl font-black text-[#C8102E] font-['Nunito'] leading-none">
            {totalQuestoes}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-2">
            Total de Questões
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-2xl font-black text-amber-600 font-['Nunito'] leading-none">
            {mediaDiaria}h/dia
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-2">
            Média Diária
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#C8102E]" />
            <h2 className="text-base font-extrabold text-[#0D134C] font-['Nunito'] uppercase tracking-wider">
              Registros Históricos
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={discFilter}
              onChange={(e) => setDiscFilter(e.target.value)}
              className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="">Todas as disciplinas</option>
              {activeConcurso.disciplinas.map(d => (
                <option key={d.id} value={d.nome}>{d.nome}</option>
              ))}
            </select>

            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(parseInt(e.target.value))}
              className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={0}>Todo o período</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-200">
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Disciplina</th>
                <th className="py-2.5 px-3">Assunto / Tópico</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Tempo</th>
                <th className="py-2.5 px-3 text-center">Questões</th>
                <th className="py-2.5 px-3 text-center">Acertos</th>
                <th className="py-2.5 px-3 text-center">Erros</th>
                <th className="py-2.5 px-3 text-center">% Acerto</th>
                <th className="py-2.5 px-3">Observações</th>
                <th className="py-2.5 px-3">Origem</th>
                <th className="py-2.5 px-3 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-gray-400">
                    Nenhum registro encontrado para este filtro.
                  </td>
                </tr>
              ) : (
                filtered.map(r => {
                  const discIdx = activeConcurso.disciplinas.findIndex(d => d.nome === r.disc);
                  const cor = discIdx >= 0 ? DISC_CORES[discIdx % DISC_CORES.length] : '#0D134C';
                  const tot = (r.acertos || 0) + (r.erros || 0);
                  const pct = tot > 0 ? Math.round((r.acertos / tot) * 100) : null;
                  const [y, m, d] = r.date.split('-');

                  return (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-3 font-semibold text-gray-800 whitespace-nowrap">
                        {d}/{m}/{y}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-extrabold truncate max-w-[130px] inline-block"
                          style={{ backgroundColor: `${cor}15`, color: cor }}
                          title={r.disc}
                        >
                          {r.disc}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-medium text-gray-700 max-w-[180px] truncate" title={r.topic}>
                        {r.topic || '—'}
                      </td>

                      <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {r.tipo || 'Teoria'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-gray-800 whitespace-nowrap">
                        {r.horas > 0 ? `${r.horas}h` : '—'}
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-gray-700">
                        {r.questoes > 0 ? r.questoes : '—'}
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-emerald-600">
                        {r.acertos > 0 ? r.acertos : '—'}
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-red-600">
                        {r.erros > 0 ? r.erros : '—'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {pct !== null ? (
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
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

                      <td className="py-3 px-3 text-gray-500 max-w-[160px] truncate text-[11px]" title={r.obs}>
                        {r.obs ? `💬 ${r.obs}` : '—'}
                      </td>

                      <td className="py-3 px-3 text-gray-400 text-[10px] capitalize whitespace-nowrap">
                        {r.origem}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => deleteHistorico(r.id)}
                          className="p-1 rounded text-gray-300 hover:text-red-600 transition cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
