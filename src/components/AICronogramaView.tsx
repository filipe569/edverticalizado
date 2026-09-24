import React, { useState } from 'react';
import { useConcurso } from '../context/ConcursoContext';
import { DISC_CORES } from '../data/defaultConcursos';
import {
  Sparkles,
  Brain,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  BookOpen,
  HelpCircle,
  FileCheck,
  Flame,
  ArrowRight,
  Loader2,
  TrendingUp,
  Layers,
} from 'lucide-react';

interface AICronogramaViewProps {
  onStartStudySession: (discNome: string, tipoEstudo: string, topico?: string) => void;
}

export const AICronogramaView: React.FC<AICronogramaViewProps> = ({
  onStartStudySession,
}) => {
  const {
    activeConcurso,
    setProficiencia,
    setProficienciasBatch,
    saveAICronograma,
    updateMetas,
    showToast,
  } = useConcurso();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [horasSemanais, setHorasSemanais] = useState<number>(activeConcurso.metas.horasSemana || 20);
  const [diasDisponiveis, setDiasDisponiveis] = useState<string[]>([
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ]);
  const [focoDesejado, setFocoDesejado] = useState('');
  const [activeDayTab, setActiveDayTab] = useState<string>('Segunda-feira');

  const diasSemanaOptions = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo',
  ];

  const proficiencias = activeConcurso.proficiencias || {};

  const toggleDia = (dia: string) => {
    if (diasDisponiveis.includes(dia)) {
      if (diasDisponiveis.length <= 1) {
        showToast('⚠️', 'Selecione pelo menos 1 dia de estudo na semana.');
        return;
      }
      setDiasDisponiveis(diasDisponiveis.filter(d => d !== dia));
    } else {
      setDiasDisponiveis([...diasDisponiveis, dia]);
    }
  };

  const setAllProficiencia = (nivel: 'iniciante' | 'intermediario' | 'avancado') => {
    const batch: Record<string, 'iniciante' | 'intermediario' | 'avancado'> = {};
    activeConcurso.disciplinas.forEach(d => {
      batch[d.nome] = nivel;
    });
    setProficienciasBatch(batch);
    showToast('👍', `Todas as matérias definidas como: ${nivel.toUpperCase()}`);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concursoInfo: {
            concurso: activeConcurso.nome,
            cargo: activeConcurso.cargo,
            banca: activeConcurso.banca,
            dataProva: activeConcurso.dataProva,
          },
          disciplinas: activeConcurso.disciplinas,
          proficiencia: proficiencias,
          horasSemanais,
          diasDisponiveis,
          focoDesejado,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Erro na resposta do servidor.');
      }

      saveAICronograma(json.data);
      if (json.data.cronogramaSemanal?.length > 0) {
        setActiveDayTab(json.data.cronogramaSemanal[0].dia);
      }
      showToast('🚀', 'Cronograma adaptativo e categorias geradas com sucesso!');
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Falha ao gerar cronograma com a IA.';
      setErrorMessage(msg);
      showToast('⚠️', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const cronogramaIA = activeConcurso.cronogramaIA;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0D134C] via-[#1a2060] to-[#2a1a45] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#AFE8D0] text-xs font-bold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#BAFF38]" />
            <span>Inteligência Artificial Pedagógica Gran Concursos</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-['Nunito'] leading-tight">
            Categorias de Estudos &amp; Cronograma Adaptativo
          </h1>
          <p className="mt-2 text-xs md:text-sm text-white/75 leading-relaxed">
            A IA analisa todo o conteúdo programático de{' '}
            <strong className="text-white font-bold">{activeConcurso.nome}</strong>, avalia sua proficiência matéria por matéria e cria um cronograma semanal sob medida, balanceando teoria, questões da banca {activeConcurso.banca || 'examinadora'} e revisões espaçadas.
          </p>
        </div>
      </div>

      {/* Step 1: Proficiência por Disciplina */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-extrabold text-[#0D134C] font-['Nunito'] flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#C8102E]" />
              <span>1. Seu Nível de Proficiência por Disciplina</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Informe seu domínio real. A IA dará mais horas de teoria para iniciantes e foco em questões/jurisprudência para avançados.
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              Atalhos:
            </span>
            <button
              onClick={() => setAllProficiencia('iniciante')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition"
            >
              Todos Iniciante
            </button>
            <button
              onClick={() => setAllProficiencia('intermediario')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 transition"
            >
              Todos Intermediário
            </button>
            <button
              onClick={() => setAllProficiencia('avancado')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition"
            >
              Todos Avançado
            </button>
          </div>
        </div>

        {/* Disciplines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
          {activeConcurso.disciplinas.map((disc, idx) => {
            const nivel = proficiencias[disc.nome] || proficiencias[disc.id] || 'intermediario';
            const cor = DISC_CORES[idx % DISC_CORES.length];

            return (
              <div
                key={disc.id}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-xs transition flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cor }} />
                    <span className="font-extrabold text-xs text-[#0D134C] truncate font-['Nunito']" title={disc.nome}>
                      {disc.nome}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 pl-4">
                    {disc.grupos.reduce((acc, g) => acc + g.topicos.length, 0)} tópicos no edital
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 bg-gray-200/60 p-1 rounded-lg text-center select-none">
                  <button
                    onClick={() => setProficiencia(disc.nome, 'iniciante')}
                    className={`py-1 rounded text-[10px] font-extrabold transition ${
                      nivel === 'iniciante'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Iniciante
                  </button>
                  <button
                    onClick={() => setProficiencia(disc.nome, 'intermediario')}
                    className={`py-1 rounded text-[10px] font-extrabold transition ${
                      nivel === 'intermediario'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Médio
                  </button>
                  <button
                    onClick={() => setProficiencia(disc.nome, 'avancado')}
                    className={`py-1 rounded text-[10px] font-extrabold transition ${
                      nivel === 'avancado'
                        ? 'bg-[#0D134C] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Avançado
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Parâmetros do Cronograma */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <h2 className="text-base font-extrabold text-[#0D134C] font-['Nunito'] flex items-center gap-2 pb-4 border-b border-gray-100">
          <Calendar className="w-5 h-5 text-[#C8102E]" />
          <span>2. Parâmetros da Sua Rotina Semanal</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Horas Semanais */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Horas de Estudo por Semana: <span className="text-[#C8102E] font-black text-sm">{horasSemanais}h</span>
            </label>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={horasSemanais}
              onChange={(e) => setHorasSemanais(parseInt(e.target.value))}
              className="w-full accent-[#C8102E] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
              <span>5h (Leve)</span>
              <span>20h (Padrão)</span>
              <span>35h (Intenso)</span>
              <span>50h (Dedicação Total)</span>
            </div>
          </div>

          {/* Dias Disponíveis */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Dias da Semana que Você Pode Estudar:
            </label>
            <div className="flex flex-wrap gap-2">
              {diasSemanaOptions.map((dia) => {
                const isSelected = diasDisponiveis.includes(dia);
                return (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => toggleDia(dia)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0D134C] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#BAFF38]" />}
                    <span>{dia}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Foco Personalizado */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Observação Particular / Foco Estratégico (Opcional):
          </label>
          <input
            type="text"
            value={focoDesejado}
            onChange={(e) => setFocoDesejado(e.target.value)}
            placeholder="Ex: Trabalho o dia todo, prefiro blocos noturnos de 45 min. Focar muito na banca FGV."
            className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0D134C] transition"
          />
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-bold block">Aviso do Mentor IA:</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#C8102E] to-[#0D134C] hover:opacity-95 text-white text-sm font-black flex items-center gap-3 shadow-lg transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>A IA está lendo o edital e elaborando seu cronograma...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-[#BAFF38]" />
                <span>{errorMessage ? 'Tentar Novamente com a IA' : 'Gerar Categorias Personalizadas & Cronograma com IA'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Display */}
      {cronogramaIA && (
        <div className="space-y-6">
          {/* Diagnóstico da IA */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2.5 text-amber-900 font-black text-sm uppercase tracking-wider mb-2">
              <Flame className="w-5 h-5 text-amber-600" />
              <span>Diagnóstico Pedagógico da IA</span>
            </div>
            <p className="text-xs md:text-sm text-amber-950 leading-relaxed whitespace-pre-line font-medium">
              {cronogramaIA.diagnostico}
            </p>
          </div>

          {/* Categorias Personalizadas de Estudo */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-extrabold text-[#0D134C] font-['Nunito'] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C8102E]" />
                <span>Categorias de Estudo Criadas pela IA</span>
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                {cronogramaIA.categorias?.length || 0} categorias estratégicas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {cronogramaIA.categorias?.map((cat, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-white hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-black text-sm text-[#0D134C] font-['Nunito']">
                        {cat.nome}
                      </h3>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                          cat.prioridade?.toLowerCase() === 'alta'
                            ? 'bg-red-100 text-red-700'
                            : cat.prioridade?.toLowerCase() === 'média' || cat.prioridade?.toLowerCase() === 'media'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        Prioridade {cat.prioridade}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-semibold text-gray-500">
                      Sugerido: <span className="text-[#0D134C] font-bold">{cat.horasSugeridasSemana}h/semana</span>
                    </div>

                    {/* Proporção Teoria / Questões / Revisão */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1">
                        <span className="text-blue-700">📖 {cat.percentualTeoria}% Teoria</span>
                        <span className="text-emerald-700">📝 {cat.percentualQuestoes}% Questões</span>
                        <span className="text-amber-700">🔁 {cat.percentualRevisao}% Rev.</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full flex overflow-hidden">
                        <div style={{ width: `${cat.percentualTeoria}%` }} className="bg-blue-500 h-full" />
                        <div style={{ width: `${cat.percentualQuestoes}%` }} className="bg-emerald-500 h-full" />
                        <div style={{ width: `${cat.percentualRevisao}%` }} className="bg-amber-500 h-full" />
                      </div>
                    </div>

                    {/* Matérias da Categoria */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {cat.disciplinas?.map((d, di) => (
                        <span key={di} className="text-[10px] font-semibold bg-white border border-gray-200 px-2 py-0.5 rounded-md text-gray-700 truncate max-w-[200px]">
                          {d}
                        </span>
                      ))}
                    </div>

                    <p className="mt-3 text-[11px] text-gray-600 leading-relaxed border-t border-gray-200/60 pt-2 italic">
                      &ldquo;{cat.estrategiaRecomendada}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cronograma Semanal Adaptado Interativo */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-extrabold text-[#0D134C] font-['Nunito'] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C8102E]" />
                  <span>Cronograma Semanal Adaptativo</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Clique em um bloco para carregar automaticamente no cronômetro de estudos.
                </p>
              </div>

              {/* Day selection tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {cronogramaIA.cronogramaSemanal?.map((diaObj) => {
                  const isActive = activeDayTab === diaObj.dia;
                  return (
                    <button
                      key={diaObj.dia}
                      onClick={() => setActiveDayTab(diaObj.dia)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                        isActive
                          ? 'bg-[#0D134C] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {diaObj.dia.split('-')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Blocks for selected day */}
            {cronogramaIA.cronogramaSemanal?.filter(d => d.dia === activeDayTab).map((diaObj) => (
              <div key={diaObj.dia} className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="font-extrabold text-[#0D134C] font-['Nunito'] text-sm">
                    {diaObj.dia}
                  </span>
                  <span className="font-bold text-gray-600">
                    Carga planejada: <strong className="text-[#C8102E] font-extrabold">{diaObj.totalHorasDia}h</strong> ({diaObj.blocos?.length || 0} blocos)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {diaObj.blocos?.map((bloco, bi) => (
                    <div
                      key={bi}
                      className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#0D134C] hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600 uppercase">
                            Bloco {bloco.blocoNum} &bull; {bloco.duracaoMinutos} min
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#dcfce7] text-[#15803d]">
                            {bloco.tipoEstudo}
                          </span>
                        </div>

                        <div className="mt-2 font-black text-sm text-[#0D134C] font-['Nunito']">
                          {bloco.disciplina}
                        </div>

                        {bloco.topicosFoco && bloco.topicosFoco.length > 0 && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <span className="font-bold text-[10px] uppercase text-gray-400 block mb-1">
                              Tópicos Recomendados:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                              {bloco.topicosFoco.map((t, ti) => (
                                <li key={ti} className="truncate" title={t}>
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="mt-2.5 text-xs text-gray-600 leading-relaxed font-medium">
                          💡 {bloco.orientacao}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => {
                            const topicoEscolhido = bloco.topicosFoco?.[0] || '';
                            onStartStudySession(bloco.disciplina, bloco.tipoEstudo, topicoEscolhido);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#0D134C] hover:bg-[#1a2060] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 text-[#BAFF38]" />
                          <span>Estudar no Cronômetro</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Metas Sugeridas e Dicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Metas */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-[#0D134C] text-sm font-['Nunito'] uppercase tracking-wider flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-[#C8102E]" />
                  <span>Metas Semanais Sugeridas pela IA</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-2xl font-black text-[#0D134C] font-['Nunito']">
                      {cronogramaIA.metasSugeridas?.horasSemanais}h
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Horas Semanais</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-2xl font-black text-[#C8102E] font-['Nunito']">
                      {cronogramaIA.metasSugeridas?.questoesSemana}
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Questões / Semana</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-2xl font-black text-[#15803d] font-['Nunito']">
                      {cronogramaIA.metasSugeridas?.aproveitamentoMinimoDesejado}%
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Aproveitamento Alvo</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-xs font-black text-amber-700 font-['Nunito'] py-2">
                      {cronogramaIA.metasSugeridas?.frequenciaRevisoes}
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Ciclo de Revisões</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  updateMetas({
                    horasSemana: cronogramaIA.metasSugeridas.horasSemanais,
                    questoesSemana: cronogramaIA.metasSugeridas.questoesSemana,
                    aproveitamento: cronogramaIA.metasSugeridas.aproveitamentoMinimoDesejado,
                  });
                  showToast('🎯', 'Metas aplicadas ao seu painel!');
                }}
                className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-sm"
              >
                Aplicar Metas ao Meu Painel de Estudos
              </button>
            </div>

            {/* Dicas Práticas */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <h3 className="font-extrabold text-[#0D134C] text-sm font-['Nunito'] uppercase tracking-wider flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-[#C8102E]" />
                <span>Recomendações Táticas do Mentor IA</span>
              </h3>
              <div className="space-y-2.5">
                {cronogramaIA.dicasPraticas?.map((dica, di) => (
                  <div key={di} className="flex items-start gap-2.5 text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[#C8102E] font-bold text-sm shrink-0">✦</span>
                    <span className="leading-relaxed">{dica}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
