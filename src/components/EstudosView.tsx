import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useConcurso } from '../context/ConcursoContext';
import { DISC_CORES } from '../data/defaultConcursos';
import {
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  CheckCircle,
  Plus,
  BookOpen,
  RotateCcw,
  Target,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';

interface EstudosViewProps {
  cronoPrefill?: {
    discNome: string;
    tipoEstudo: string;
    topico?: string;
  } | null;
  onClearCronoPrefill?: () => void;
}

export const EstudosView: React.FC<EstudosViewProps> = ({
  cronoPrefill,
  onClearCronoPrefill,
}) => {
  const {
    activeConcurso,
    progress,
    historico,
    addHistorico,
    addRevisao,
    updateMetas,
    updateTopicQuestions,
    showToast,
  } = useConcurso();

  // ── CRONÔMETRO STATE ────────────────────────────────────
  const [cronoRunning, setCronoRunning] = useState(false);
  const [cronoAccumSecs, setCronoAccumSecs] = useState(0);
  const [cronoStartTime, setCronoStartTime] = useState<number | null>(null);
  const [displayedSecs, setDisplayedSecs] = useState(0);

  const [selectedDisc, setSelectedDisc] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [tipoEstudo, setTipoEstudo] = useState('Teoria');
  const [revDays, setRevDays] = useState<number[]>([]);
  const [customRevDay, setCustomRevDay] = useState('');
  const [cronoAcertos, setCronoAcertos] = useState('');
  const [cronoErros, setCronoErros] = useState('');
  const [cronoObs, setCronoObs] = useState('');

  // Handle prefill from AI or Edital
  useEffect(() => {
    if (cronoPrefill) {
      if (cronoPrefill.discNome) setSelectedDisc(cronoPrefill.discNome);
      if (cronoPrefill.tipoEstudo) setTipoEstudo(cronoPrefill.tipoEstudo);
      if (cronoPrefill.topico) setSelectedTopic(cronoPrefill.topico);
      onClearCronoPrefill?.();
    }
  }, [cronoPrefill]);

  // Crono tick
  useEffect(() => {
    let interval: any = null;
    if (cronoRunning && cronoStartTime) {
      interval = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - cronoStartTime) / 1000);
        setDisplayedSecs(cronoAccumSecs + currentElapsed);
      }, 500);
    } else {
      setDisplayedSecs(cronoAccumSecs);
    }
    return () => clearInterval(interval);
  }, [cronoRunning, cronoStartTime, cronoAccumSecs]);

  const handleStartCrono = () => {
    setCronoRunning(true);
    setCronoStartTime(Date.now());
  };

  const handlePauseCrono = () => {
    if (cronoRunning && cronoStartTime) {
      const elapsed = Math.floor((Date.now() - cronoStartTime) / 1000);
      setCronoAccumSecs(prev => prev + elapsed);
      setCronoStartTime(null);
      setCronoRunning(false);
    }
  };

  const handleStopCrono = () => {
    let totalSecs = cronoAccumSecs;
    if (cronoRunning && cronoStartTime) {
      totalSecs += Math.floor((Date.now() - cronoStartTime) / 1000);
    }

    if (totalSecs > 0) {
      const horas = Math.round((totalSecs / 3600) * 100) / 100;
      const ac = parseInt(cronoAcertos) || 0;
      const er = parseInt(cronoErros) || 0;
      const todayStr = new Date().toISOString().slice(0, 10);

      // Add to historico
      addHistorico({
        date: todayStr,
        disc: selectedDisc || 'Geral',
        topic: selectedTopic || 'Geral',
        tipo: tipoEstudo || 'Teoria',
        horas,
        questoes: ac + er,
        acertos: ac,
        erros: er,
        obs: cronoObs.trim(),
        origem: 'cronômetro',
      });

      // Schedule revisions
      const allRevDays = [...revDays];
      const customDay = parseInt(customRevDay);
      if (customDay > 0 && !allRevDays.includes(customDay)) {
        allRevDays.push(customDay);
      }

      if (allRevDays.length > 0 && selectedTopic) {
        allRevDays.forEach(days => {
          const revDate = new Date();
          revDate.setDate(revDate.getDate() + days);
          addRevisao({
            disc: selectedDisc,
            topic: selectedTopic,
            studyDate: todayStr,
            revDate: revDate.toISOString().slice(0, 10),
            days,
            done: false,
          });
        });
      }

      showToast(
        '✅',
        `${formatSeconds(totalSecs)} registrados com sucesso! ${allRevDays.length > 0 ? `(${allRevDays.length} revisões agendadas)` : ''}`
      );
    }

    // Reset crono
    setCronoRunning(false);
    setCronoStartTime(null);
    setCronoAccumSecs(0);
    setDisplayedSecs(0);
    setCronoAcertos('');
    setCronoErros('');
    setCronoObs('');
    setRevDays([]);
    setCustomRevDay('');
  };

  // ── INSERÇÃO MANUAL STATE ───────────────────────────────
  const [manDate, setManDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [manH, setManH] = useState('');
  const [manM, setManM] = useState('');
  const [manS, setManS] = useState('');
  const [manDisc, setManDisc] = useState('');
  const [manTopic, setManTopic] = useState('');
  const [manTipo, setManTipo] = useState('Teoria');
  const [manAcertos, setManAcertos] = useState('');
  const [manErros, setManErros] = useState('');
  const [manObs, setManObs] = useState('');

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(manH) || 0;
    const m = parseFloat(manM) || 0;
    const s = parseFloat(manS) || 0;
    const ac = parseInt(manAcertos) || 0;
    const er = parseInt(manErros) || 0;
    const totalQ = ac + er;
    const totalHoras = Math.round((h + m / 60 + s / 3600) * 100) / 100;

    if (totalHoras === 0 && totalQ === 0) {
      showToast('⚠️', 'Preencha o tempo estudado ou a quantidade de questões.');
      return;
    }

    addHistorico({
      date: manDate,
      disc: manDisc || 'Geral',
      topic: manTopic || 'Geral',
      tipo: manTipo || 'Teoria',
      horas: totalHoras,
      questoes: totalQ,
      acertos: ac,
      erros: er,
      obs: manObs.trim(),
      origem: 'manual',
    });

    setManH('');
    setManM('');
    setManS('');
    setManAcertos('');
    setManErros('');
    setManObs('');
    showToast('✅', 'Registro de estudo manual adicionado!');
  };

  // ── CALENDÁRIO INTERATIVO ───────────────────────────────
  const [calMonthOffset, setCalMonthOffset] = useState(0);
  const [modalDate, setModalDate] = useState<string | null>(null);

  const targetDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + calMonthOffset);
    return d;
  }, [calMonthOffset]);

  const monthName = targetDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const calendarDays = useMemo(() => {
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    const firstDayOfWeek = new Date(y, m, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const days: Array<{
      dateKey: string;
      dayNum: number;
      isCurrentMonth: boolean;
      totalHoras: number;
      questoes: number;
      isToday: boolean;
    }> = [];

    const todayStr = new Date().toISOString().slice(0, 10);

    // Padding before
    const prevMonthDays = new Date(y, m, 0).getDate();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevD = prevMonthDays - firstDayOfWeek + 1 + i;
      const prevDateKey = new Date(y, m - 1, prevD).toISOString().slice(0, 10);
      days.push({
        dateKey: prevDateKey,
        dayNum: prevD,
        isCurrentMonth: false,
        totalHoras: 0,
        questoes: 0,
        isToday: prevDateKey === todayStr,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(y, m, d);
      const dateKey = curDate.toISOString().slice(0, 10);
      const regs = historico.filter(h => h.concursoId === activeConcurso.id && h.date === dateKey);
      const hSum = regs.reduce((acc, r) => acc + (r.horas || 0), 0);
      const qSum = regs.reduce((acc, r) => acc + (r.questoes || 0), 0);

      days.push({
        dateKey,
        dayNum: d,
        isCurrentMonth: true,
        totalHoras: Math.round(hSum * 10) / 10,
        questoes: qSum,
        isToday: dateKey === todayStr,
      });
    }

    return days;
  }, [targetDate, historico, activeConcurso.id]);

  // ── PROGRESS & STATS SUMMARY ────────────────────────────
  const { totalTopicos, concluidosTopicos, pctEdital } = useMemo(() => {
    let tot = 0;
    let conc = 0;
    activeConcurso.disciplinas.forEach(d => {
      d.grupos.forEach(g => {
        g.topicos.forEach((_, i) => {
          tot++;
          const tid = `${d.id}_${slugify(g.nome)}_${i}`;
          if (progress[tid]?.done) conc++;
        });
      });
    });
    return {
      totalTopicos: tot,
      concluidosTopicos: conc,
      pctEdital: tot > 0 ? Math.round((conc / tot) * 100) : 0,
    };
  }, [activeConcurso, progress]);

  // Acertos and Erros for active contest
  const { totalAcertos, totalErros, totalQuestoes, aproveitamento } = useMemo(() => {
    const regs = historico.filter(h => h.concursoId === activeConcurso.id);
    const ac = regs.reduce((s, r) => s + (r.acertos || 0), 0);
    const er = regs.reduce((s, r) => s + (r.erros || 0), 0);
    const tot = ac + er;
    return {
      totalAcertos: ac,
      totalErros: er,
      totalQuestoes: tot,
      aproveitamento: tot > 0 ? Math.round((ac / tot) * 100) : null,
    };
  }, [historico, activeConcurso.id]);

  // Current week stats (Sunday to Saturday)
  const { weekHoras, weekQuestoes } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startKey = startOfWeek.toISOString().slice(0, 10);

    const regs = historico.filter(h => h.concursoId === activeConcurso.id && h.date >= startKey);
    const h = regs.reduce((s, r) => s + (r.horas || 0), 0);
    const q = regs.reduce((s, r) => s + (r.questoes || 0), 0);
    return {
      weekHoras: Math.round(h * 10) / 10,
      weekQuestoes: q,
    };
  }, [historico, activeConcurso.id]);

  // Today study hours
  const todayHoras = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const regs = historico.filter(h => h.concursoId === activeConcurso.id && h.date === todayStr);
    const h = regs.reduce((s, r) => s + (r.horas || 0), 0);
    return formatHoras(h);
  }, [historico, activeConcurso.id]);

  // Topics for selected discipline in Crono
  const topicsForSelectedDisc = useMemo(() => {
    const disc = activeConcurso.disciplinas.find(d => d.nome === selectedDisc);
    if (!disc) return [];
    return disc.grupos.flatMap(g => g.topicos);
  }, [activeConcurso, selectedDisc]);

  const topicsForManDisc = useMemo(() => {
    const disc = activeConcurso.disciplinas.find(d => d.nome === manDisc);
    if (!disc) return [];
    return disc.grupos.flatMap(g => g.topicos);
  }, [activeConcurso, manDisc]);

  return (
    <div className="space-y-6">
      {/* ── MEU PROGRESSO CARD ── */}
      <div className="bg-[#0D134C] text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Meu Progresso no Edital
              </div>
              <div className="text-xs text-white/70 mt-1 font-medium">
                <strong className="text-white font-extrabold">{concluidosTopicos}</strong> de{' '}
                {totalTopicos} tópicos concluídos
              </div>
            </div>
            <div className="text-4xl font-black font-['Nunito'] text-[#AFE8D0] leading-none">
              {pctEdital}%
            </div>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#AFE8D0] to-[#BAFF38] rounded-full transition-all duration-700"
              style={{ width: `${pctEdital}%` }}
            />
          </div>
        </div>

        <div className="flex gap-4 md:gap-6 shrink-0 justify-around w-full md:w-auto border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
          <div className="text-center">
            <div className="text-2xl font-black text-[#AFE8D0] font-['Nunito'] leading-none">
              {totalAcertos}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-white/40 mt-1">Acertos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-[#EFBD7B] font-['Nunito'] leading-none">
              {totalErros}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-white/40 mt-1">Erros</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-[#aab4ff] font-['Nunito'] leading-none">
              {totalQuestoes}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-white/40 mt-1">Questões</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-[#BAFF38] font-['Nunito'] leading-none">
              {aproveitamento !== null ? `${aproveitamento}%` : '—'}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-white/40 mt-1">Aproveitamento</div>
          </div>
        </div>
      </div>

      {/* ── TRACKER ROW: CRONÔMETRO + CALENDÁRIO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRONÔMETRO CARD */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C8102E]" />
                <h3 className="font-extrabold text-sm text-[#0D134C] font-['Nunito'] uppercase tracking-wider">
                  Cronômetro de Estudos
                </h3>
              </div>
              <span className="text-[11px] text-gray-500 font-semibold">
                Hoje: <strong className="text-[#0D134C]">{todayHoras}</strong>
              </span>
            </div>

            {/* Big Timer Display */}
            <div className="flex flex-col items-center justify-center my-4">
              <div
                className={`text-5xl md:text-6xl font-black font-['Nunito'] tracking-wider leading-none transition-colors ${
                  cronoRunning ? 'text-[#C8102E]' : cronoAccumSecs > 0 ? 'text-[#b45309]' : 'text-[#0D134C]'
                }`}
              >
                {formatSeconds(displayedSecs)}
              </div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-2">
                {cronoRunning
                  ? 'Estudo em andamento...'
                  : cronoAccumSecs > 0
                  ? 'Pausado — clique em Continuar ou Parar'
                  : 'Pronto para iniciar'}
              </div>
            </div>

            {/* Timer Actions */}
            <div className="flex items-center justify-center gap-2 my-2">
              {!cronoRunning ? (
                <button
                  onClick={handleStartCrono}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{cronoAccumSecs > 0 ? 'Continuar' : 'Iniciar Estudo'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseCrono}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#0D134C] font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition"
                >
                  <Pause className="w-4 h-4 fill-[#0D134C]" />
                  <span>Pausar</span>
                </button>
              )}

              {(cronoRunning || cronoAccumSecs > 0) && (
                <button
                  onClick={handleStopCrono}
                  className="px-6 py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-[#C8102E] font-black text-xs flex items-center gap-2 border border-red-300 transition cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-[#C8102E]" />
                  <span>Parar e Registrar</span>
                </button>
              )}
            </div>

            {/* Session Settings */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                    Disciplina
                  </label>
                  <select
                    value={selectedDisc}
                    onChange={(e) => {
                      setSelectedDisc(e.target.value);
                      setSelectedTopic('');
                    }}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0D134C]"
                  >
                    <option value="">— Selecione a Disciplina —</option>
                    {activeConcurso.disciplinas.map(d => (
                      <option key={d.id} value={d.nome}>
                        {d.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                    Tipo de Estudo
                  </label>
                  <select
                    value={tipoEstudo}
                    onChange={(e) => setTipoEstudo(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0D134C]"
                  >
                    <option value="Teoria">📖 Teoria</option>
                    <option value="Questões">📝 Questões</option>
                    <option value="Simulado">🎯 Simulado</option>
                    <option value="Lei Seca">⚖️ Lei Seca</option>
                    <option value="Jurisprudência">🏛️ Jurisprudência</option>
                    <option value="Discursiva">✍️ Discursiva</option>
                  </select>
                </div>
              </div>

              {selectedDisc && topicsForSelectedDisc.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                    Assunto / Tópico do Edital
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0D134C] truncate"
                  >
                    <option value="">— Selecione o tópico (opcional) —</option>
                    {topicsForSelectedDisc.map((t, idx) => (
                      <option key={idx} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Revisions Scheduling Pills */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                  Agendar Revisão Espaçada Automática
                </label>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {[7, 15, 21, 30].map(days => {
                    const active = revDays.includes(days);
                    return (
                      <button
                        key={days}
                        type="button"
                        onClick={() => {
                          setRevDays(prev =>
                            prev.includes(days) ? prev.filter(d => d !== days) : [...prev, days]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                          active
                            ? 'bg-[#0D134C] text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {days} dias
                      </button>
                    );
                  })}
                  <input
                    type="number"
                    placeholder="Custom (dias)"
                    min={1}
                    max={365}
                    value={customRevDay}
                    onChange={(e) => setCustomRevDay(e.target.value)}
                    className="w-24 p-1 text-[11px] font-semibold bg-white border border-gray-200 rounded-md text-center"
                  />
                </div>
              </div>

              {/* Questões counters and obs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-emerald-700 mb-1">
                    Acertos
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={cronoAcertos}
                    onChange={(e) => setCronoAcertos(e.target.value)}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-center text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-red-600 mb-1">
                    Erros
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={cronoErros}
                    onChange={(e) => setCronoErros(e.target.value)}
                    className="w-full p-2 bg-white border border-red-300 rounded-lg text-xs font-bold text-center text-red-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                  Observações da Sessão
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Tive dúvida no conceito de nulidade relativa, revisar lei seca..."
                  value={cronoObs}
                  onChange={(e) => setCronoObs(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs resize-none"
                />
              </div>
            </div>
          </div>

          {/* Inserção Manual Rápida */}
          <div className="pt-4 border-t border-gray-200">
            <details className="group cursor-pointer">
              <summary className="text-xs font-extrabold text-gray-500 uppercase tracking-wider flex items-center justify-between list-none">
                <span>✏️ Inserir Estudo Manualmente</span>
                <span className="text-xs group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <form onSubmit={handleManualAdd} className="mt-3 space-y-3 pt-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">Data</label>
                    <input
                      type="date"
                      required
                      value={manDate}
                      onChange={(e) => setManDate(e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">Horas</label>
                    <input
                      type="number"
                      min={0}
                      max={24}
                      placeholder="0"
                      value={manH}
                      onChange={(e) => setManH(e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">Minutos</label>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="0"
                      value={manM}
                      onChange={(e) => setManM(e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">Segundos</label>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="0"
                      value={manS}
                      onChange={(e) => setManS(e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs font-bold text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">Disciplina</label>
                    <select
                      value={manDisc}
                      onChange={(e) => {
                        setManDisc(e.target.value);
                        setManTopic('');
                      }}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs"
                    >
                      <option value="">— Selecione —</option>
                      {activeConcurso.disciplinas.map(d => (
                        <option key={d.id} value={d.nome}>{d.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">Tipo</label>
                    <select
                      value={manTipo}
                      onChange={(e) => setManTipo(e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs"
                    >
                      <option value="Teoria">📖 Teoria</option>
                      <option value="Questões">📝 Questões</option>
                      <option value="Simulado">🎯 Simulado</option>
                      <option value="Lei Seca">⚖️ Lei Seca</option>
                      <option value="Jurisprudência">🏛️ Jurisprudência</option>
                      <option value="Discursiva">✍️ Discursiva</option>
                    </select>
                  </div>
                </div>

                {manDisc && topicsForManDisc.length > 0 && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">Tópico</label>
                    <select
                      value={manTopic}
                      onChange={(e) => setManTopic(e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs truncate"
                    >
                      <option value="">— Selecione o tópico —</option>
                      {topicsForManDisc.map((t, idx) => (
                        <option key={idx} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-700 block uppercase">Acertos</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={manAcertos}
                      onChange={(e) => setManAcertos(e.target.value)}
                      className="w-full p-1.5 border border-emerald-300 rounded text-xs text-center font-bold text-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-red-600 block uppercase">Erros</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={manErros}
                      onChange={(e) => setManErros(e.target.value)}
                      className="w-full p-1.5 border border-red-300 rounded text-xs text-center font-bold text-red-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#0D134C] hover:bg-[#1a2060] text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  + Salvar Registro Manual
                </button>
              </form>
            </details>
          </div>
        </div>

        {/* CALENDÁRIO CARD */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C8102E]" />
                <h3 className="font-extrabold text-sm text-[#0D134C] font-['Nunito'] uppercase tracking-wider capitalize">
                  {monthName}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCalMonthOffset(prev => prev - 1)}
                  className="p-1 rounded-md border border-gray-200 hover:bg-gray-100 transition"
                  title="Mês anterior"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setCalMonthOffset(0)}
                  className="px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-100 text-[10px] font-bold transition"
                  title="Mês atual"
                >
                  Hoje
                </button>
                <button
                  onClick={() => setCalMonthOffset(prev => prev + 1)}
                  className="p-1 rounded-md border border-gray-200 hover:bg-gray-100 transition"
                  title="Próximo mês"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="mt-4">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                <span>Dom</span>
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((d, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (d.isCurrentMonth) setModalDate(d.dateKey);
                    }}
                    className={`min-h-[52px] p-1 rounded-lg border flex flex-col justify-between transition cursor-pointer select-none ${
                      d.isToday
                        ? 'border-[#C8102E] bg-red-50/50 ring-1 ring-[#C8102E]'
                        : d.totalHoras > 0
                        ? 'border-gray-300 bg-white hover:border-[#0D134C]'
                        : d.isCurrentMonth
                        ? 'border-transparent bg-gray-50/80 hover:bg-white hover:border-gray-200'
                        : 'border-transparent opacity-20 pointer-events-none'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[11px]">
                      <span className={`font-bold ${d.isToday ? 'text-[#C8102E]' : 'text-gray-700'}`}>
                        {d.dayNum}
                      </span>
                    </div>

                    {d.totalHoras > 0 && (
                      <div className="text-[9px] font-black text-emerald-700 leading-tight">
                        ⏱ {d.totalHoras}h
                      </div>
                    )}
                    {d.questoes > 0 && (
                      <div className="text-[8px] font-bold text-gray-500">
                        {d.questoes}q
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-gray-500 pt-4 border-t border-gray-100 mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C8102E]" />
              <span>Hoje</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Horas Registradas</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── METAS DE ESTUDO ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#C8102E]" />
            <h3 className="font-extrabold text-sm text-[#0D134C] font-['Nunito'] uppercase tracking-wider">
              Metas de Estudo Semanais
            </h3>
          </div>
          <span className="text-[11px] text-gray-500">
            Atualização automática via cronômetro e histórico
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {/* Horas Semana */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-gray-600">
              <span>⏱️ Horas / Semana</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase font-black">
                Auto
              </span>
            </div>
            <div className="my-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Meta</span>
                <input
                  type="number"
                  min={0}
                  value={activeConcurso.metas.horasSemana || 20}
                  onChange={(e) => updateMetas({ horasSemana: parseFloat(e.target.value) || 0 })}
                  className="w-16 font-extrabold text-xl text-[#0D134C] bg-white border border-gray-200 rounded px-1 text-center"
                />
              </div>
              <span className="text-gray-300 font-bold">→</span>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Realizado</span>
                <span className="text-xl font-extrabold text-emerald-600">{weekHoras}h</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#0D134C] h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    activeConcurso.metas.horasSemana > 0
                      ? Math.round((weekHoras / activeConcurso.metas.horasSemana) * 100)
                      : 0
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Questões Semana */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-gray-600">
              <span>📝 Questões / Semana</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase font-black">
                Auto
              </span>
            </div>
            <div className="my-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Meta</span>
                <input
                  type="number"
                  min={0}
                  value={activeConcurso.metas.questoesSemana || 150}
                  onChange={(e) => updateMetas({ questoesSemana: parseInt(e.target.value) || 0 })}
                  className="w-16 font-extrabold text-xl text-[#0D134C] bg-white border border-gray-200 rounded px-1 text-center"
                />
              </div>
              <span className="text-gray-300 font-bold">→</span>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Realizado</span>
                <span className="text-xl font-extrabold text-[#C8102E]">{weekQuestoes}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#C8102E] h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    activeConcurso.metas.questoesSemana > 0
                      ? Math.round((weekQuestoes / activeConcurso.metas.questoesSemana) * 100)
                      : 0
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Conclusão Edital */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-gray-600">
              <span>✅ Conclusão do Edital</span>
            </div>
            <div className="my-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Meta %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={activeConcurso.metas.conclusaoEdital || 100}
                  onChange={(e) => updateMetas({ conclusaoEdital: parseInt(e.target.value) || 0 })}
                  className="w-16 font-extrabold text-xl text-[#0D134C] bg-white border border-gray-200 rounded px-1 text-center"
                />
              </div>
              <span className="text-gray-300 font-bold">→</span>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Progresso</span>
                <span className="text-xl font-extrabold text-emerald-600">{pctEdital}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${pctEdital}%` }}
              />
            </div>
          </div>

          {/* Aproveitamento Alvo */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-gray-600">
              <span>🏆 Aproveitamento Alvo</span>
            </div>
            <div className="my-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Meta %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={activeConcurso.metas.aproveitamento || 75}
                  onChange={(e) => updateMetas({ aproveitamento: parseInt(e.target.value) || 0 })}
                  className="w-16 font-extrabold text-xl text-[#0D134C] bg-white border border-gray-200 rounded px-1 text-center"
                />
              </div>
              <span className="text-gray-300 font-bold">→</span>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Atual</span>
                <span className="text-xl font-extrabold text-amber-600">
                  {aproveitamento !== null ? `${aproveitamento}%` : '—'}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${aproveitamento || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper utils
function formatSeconds(s: number) {
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${ss}`;
}

function formatHoras(h: number) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}h ${mm.toString().padStart(2, '0')}min`;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}
