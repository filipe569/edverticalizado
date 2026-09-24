import React, { useState, useMemo } from 'react';
import { useConcurso } from '../context/ConcursoContext';
import { DISC_CORES } from '../data/defaultConcursos';
import { BarChart3, TrendingUp, Clock, CheckCircle2, Award } from 'lucide-react';

export const EstatisticasView: React.FC = () => {
  const { activeConcurso, historico } = useConcurso();

  const [periodDays, setPeriodDays] = useState<number>(30); // 7, 14, 30, 0
  const [selectedDisc, setSelectedDisc] = useState<string>('');

  const cutoffDate = periodDays > 0 ? new Date(Date.now() - periodDays * 86400000) : null;

  const filtered = useMemo(() => {
    return historico.filter(r => {
      if (r.concursoId !== activeConcurso.id) return false;
      if (selectedDisc && r.disc !== selectedDisc) return false;
      if (cutoffDate && new Date(r.date + 'T00:00:00') < cutoffDate) return false;
      return true;
    });
  }, [historico, activeConcurso.id, selectedDisc, cutoffDate]);

  // Overall KPIs
  const { totalHoras, totalAc, totalEr, totalQ, aproveitamento } = useMemo(() => {
    const h = filtered.reduce((s, r) => s + (r.horas || 0), 0);
    const ac = filtered.reduce((s, r) => s + (r.acertos || 0), 0);
    const er = filtered.reduce((s, r) => s + (r.erros || 0), 0);
    const q = ac + er;
    return {
      totalHoras: Math.round(h * 10) / 10,
      totalAc: ac,
      totalEr: er,
      totalQ: q,
      aproveitamento: q > 0 ? Math.round((ac / q) * 100) : null,
    };
  }, [filtered]);

  // Per-discipline breakdown
  const discBreakdown = useMemo(() => {
    return activeConcurso.disciplinas.map((d, i) => {
      const dRegs = historico.filter(
        r => r.concursoId === activeConcurso.id && r.disc === d.nome && (!cutoffDate || new Date(r.date + 'T00:00:00') >= cutoffDate)
      );
      const h = dRegs.reduce((s, r) => s + (r.horas || 0), 0);
      const ac = dRegs.reduce((s, r) => s + (r.acertos || 0), 0);
      const er = dRegs.reduce((s, r) => s + (r.erros || 0), 0);
      const q = ac + er;
      const pct = q > 0 ? Math.round((ac / q) * 100) : null;

      return {
        nome: d.nome,
        cor: DISC_CORES[i % DISC_CORES.length],
        horas: Math.round(h * 10) / 10,
        acertos: ac,
        erros: er,
        totalQ: q,
        pct,
      };
    }).sort((a, b) => b.horas + b.totalQ - (a.horas + a.totalQ));
  }, [activeConcurso, historico, cutoffDate]);

  const maxHoras = Math.max(...discBreakdown.map(d => d.horas), 0.1);

  // Study types breakdown
  const typesBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(r => {
      const t = r.tipo || 'Teoria';
      map[t] = (map[t] || 0) + (r.horas || 0);
    });
    return Object.entries(map).map(([tipo, h]) => ({
      tipo,
      horas: Math.round(h * 10) / 10,
    })).sort((a, b) => b.horas - a.horas);
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#C8102E]" />
          <h2 className="text-base font-extrabold text-[#0D134C] font-['Nunito'] uppercase tracking-wider">
            Painel de Estatísticas &amp; Desempenho
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDisc}
            onChange={(e) => setSelectedDisc(e.target.value)}
            className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="">Todas as disciplinas</option>
            {activeConcurso.disciplinas.map(d => (
              <option key={d.id} value={d.nome}>{d.nome}</option>
            ))}
          </select>

          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(parseInt(e.target.value))}
            className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={14}>Últimos 14 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={0}>Todo o período</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-3xl font-black text-[#0D134C] font-['Nunito'] leading-none">
            {totalHoras}h
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-2">
            Horas no Período
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-3xl font-black text-emerald-600 font-['Nunito'] leading-none">
            {totalAc}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-2">
            Acertos Registrados
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-3xl font-black text-red-600 font-['Nunito'] leading-none">
            {totalEr}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-2">
            Erros Registrados
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-3xl font-black text-[#C8102E] font-['Nunito'] leading-none">
            {aproveitamento !== null ? `${aproveitamento}%` : '—'}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-2">
            Aproveitamento Geral
          </div>
        </div>
      </div>

      {/* Per-discipline breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Distribuição de Desempenho por Disciplina
        </h3>

        <div className="space-y-3">
          {discBreakdown.map((d, i) => {
            const barW = Math.max(3, Math.round((d.horas / maxHoras) * 100));

            return (
              <div
                key={i}
                className="p-3 bg-gray-50/70 hover:bg-gray-50 border border-gray-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-2.5 min-w-[200px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.cor }} />
                  <span className="font-extrabold text-xs text-[#0D134C] truncate" title={d.nome}>
                    {d.nome}
                  </span>
                </div>

                <div className="flex-1 max-w-md mx-2">
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${barW}%`, backgroundColor: d.cor }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                  <span className="text-gray-700 min-w-14 text-right">
                    ⏱ {d.horas}h
                  </span>
                  <span className="text-emerald-700 min-w-12 text-right">
                    {d.acertos} ac
                  </span>
                  <span className="text-red-600 min-w-12 text-right">
                    {d.erros} er
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-black text-[11px] min-w-14 text-center ${
                      d.pct === null
                        ? 'bg-gray-200 text-gray-500'
                        : d.pct >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : d.pct >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {d.pct !== null ? `${d.pct}%` : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
