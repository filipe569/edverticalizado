import React, { useState } from 'react';
import { useConcurso } from '../context/ConcursoContext';
import { Concurso, Disciplina } from '../types/concurso';
import {
  X,
  Plus,
  Sparkles,
  Trash2,
  Edit2,
  CheckCircle,
  FileText,
  Calendar,
  Layers,
  Building2,
  Loader2,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface ConcursoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AIPreviewType {
  concurso?: string;
  nome?: string;
  cargo?: string;
  banca?: string;
  dataProva?: string;
  disciplinas?: Disciplina[];
}

export const ConcursoManagerModal: React.FC<ConcursoManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    concursos,
    activeConcursoId,
    switchConcurso,
    createConcurso,
    updateConcurso,
    deleteConcurso,
    showToast,
  } = useConcurso();

  const [activeTab, setActiveTab] = useState<'lista' | 'novo-manual' | 'novo-ia'>('lista');

  // Form state for manual new concurso
  const [manualForm, setManualForm] = useState({
    nome: '',
    cargo: '',
    banca: '',
    dataProva: '',
    disciplinasRaw: 'LÍNGUA PORTUGUESA\nRACIOCÍNIO LÓGICO\nDIREITO CONSTITUCIONAL\nDIREITO ADMINISTRATIVO',
  });

  // AI Import state
  const [aiRawText, setAiRawText] = useState('');
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPreview, setAiPreview] = useState<AIPreviewType | null>(null);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.nome.trim()) {
      showToast('⚠️', 'Preencha o nome do concurso/órgão.');
      return;
    }

    const lines = manualForm.disciplinasRaw
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const disciplinas: Disciplina[] = lines.map((name, i) => {
      const slugId = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      return {
        id: slugId || `disc-${i}`,
        nome: name.toUpperCase(),
        grupos: [
          {
            nome: 'Conteúdo Geral',
            topicos: [
              `1. Conceitos fundamentais de ${name}`,
              `2. Tópicos principais e resolução de questões`,
            ],
          },
        ],
      };
    });

    const newConcurso: Concurso = {
      id: `concurso-${Date.now()}`,
      nome: manualForm.nome.trim(),
      cargo: manualForm.cargo.trim() || 'Geral',
      banca: manualForm.banca.trim() || 'A definir',
      dataProva: manualForm.dataProva || '',
      metas: {
        horasSemana: 20,
        questoesSemana: 150,
        conclusaoEdital: 100,
        aproveitamento: 75,
      },
      proficiencias: {},
      disciplinas: disciplinas.length > 0 ? disciplinas : [
        {
          id: 'conhecimentos-gerais',
          nome: 'CONHECIMENTOS GERAIS',
          grupos: [
            {
              nome: 'Geral',
              topicos: ['1. Tópico inicial'],
            },
          ],
        },
      ],
    };

    createConcurso(newConcurso);
    setManualForm({
      nome: '',
      cargo: '',
      banca: '',
      dataProva: '',
      disciplinasRaw: '',
    });
    setActiveTab('lista');
  };

  const handleAIParse = async () => {
    if (!aiRawText.trim()) {
      showToast('⚠️', 'Cole o texto do edital ou conteúdo programático.');
      return;
    }

    setAiIsLoading(true);
    setAiError(null);
    setAiPreview(null);

    try {
      const res = await fetch('/api/ai/parse-edital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: aiRawText }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Erro ao processar com IA.');
      }

      setAiPreview(json.data);
      showToast('✨', 'Edital lido com sucesso pela IA! Revise e confirme.');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || 'Falha ao processar edital com a IA.';
      setAiError(errMsg);
      showToast('⚠️', errMsg);
    } finally {
      setAiIsLoading(false);
    }
  };

  const handleConfirmAIConcurso = () => {
    if (!aiPreview || !aiPreview.disciplinas) return;

    const newConcurso: Concurso = {
      id: `ai-concurso-${Date.now()}`,
      nome: aiPreview.concurso || 'Concurso Importado via IA',
      cargo: aiPreview.cargo || 'Cargo Não Especificado',
      banca: aiPreview.banca || 'A definir',
      dataProva: aiPreview.dataProva || '',
      metas: {
        horasSemana: 20,
        questoesSemana: 150,
        conclusaoEdital: 100,
        aproveitamento: 75,
      },
      proficiencias: {},
      disciplinas: aiPreview.disciplinas as Disciplina[],
    };

    createConcurso(newConcurso);
    setAiRawText('');
    setAiPreview(null);
    setActiveTab('lista');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0D134C]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0D134C] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8102E] flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-['Nunito']">Gerenciador de Editais & Concursos</h2>
              <p className="text-xs text-white/60">Alterne entre concursos ou importe novos editais com Inteligência Artificial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('lista')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'lista'
                ? 'bg-white text-[#0D134C] border-t-2 border-[#C8102E] shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Meus Editais ({concursos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('novo-ia')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'novo-ia'
                ? 'bg-white text-[#0D134C] border-t-2 border-[#C8102E] shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C8102E]" />
            <span>Importar Edital com IA</span>
            <span className="text-[9px] bg-[#AFE8D0] text-[#0D134C] px-1.5 py-0.2 rounded-full font-black">NOVO</span>
          </button>
          <button
            onClick={() => setActiveTab('novo-manual')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'novo-manual'
                ? 'bg-white text-[#0D134C] border-t-2 border-[#C8102E] shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Criar Manualmente</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'lista' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Editais cadastrados no seu navegador
                </span>
                <span className="text-xs text-gray-500">
                  Clique no concurso para ativá-lo instantaneamente
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {concursos.map((c) => {
                  const isActive = c.id === activeConcursoId;
                  const totalTopicos = c.disciplinas.reduce(
                    (acc, d) => acc + d.grupos.reduce((gacc, g) => gacc + g.topicos.length, 0),
                    0
                  );

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        switchConcurso(c.id);
                        onClose();
                      }}
                      className={`p-4 rounded-xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                        isActive
                          ? 'border-[#C8102E] bg-red-50/30 shadow-md ring-2 ring-[#C8102E]/20'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-xs bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-[#0D134C] text-sm font-['Nunito'] leading-tight">
                            {c.nome}
                          </h3>
                          {isActive && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#C8102E] text-white">
                              ATIVO
                            </span>
                          )}
                        </div>

                        <div className="mt-1.5 text-xs text-gray-600 font-medium">
                          {c.cargo} &bull; <span className="font-bold text-[#b45309]">{c.banca}</span>
                        </div>

                        <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-500">
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md font-semibold">
                            📚 {c.disciplinas.length} disciplinas
                          </span>
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md font-semibold">
                            📋 {totalTopicos} tópicos
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          {c.dataProva
                            ? `Prova: ${new Date(c.dataProva + 'T00:00:00').toLocaleDateString('pt-BR')}`
                            : 'Data a definir'}
                        </span>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {concursos.length > 1 && (
                            <button
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir o edital "${c.nome}"?`)) {
                                  deleteConcurso(c.id);
                                }
                              }}
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Excluir edital"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'novo-ia' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <strong className="font-bold">Leitor de Editais com IA:</strong> Cole abaixo o texto bruto retirado do Diário Oficial, PDF do edital ou site da banca. A inteligência artificial identificará o cargo, a banca organizadora e estruturará automaticamente todas as matérias e tópicos verticalizados!
                </div>
              </div>

              {!aiPreview ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Cole o Conteúdo Programático do Edital:
                  </label>
                  <textarea
                    rows={10}
                    value={aiRawText}
                    onChange={(e) => setAiRawText(e.target.value)}
                    placeholder="Exemplo: CONCURSO PÚBLICO POLÍCIA CIVIL... LÍNGUA PORTUGUESA: 1. Interpretação de texto... NOÇÕES DE DIREITO PENAL: 1. Crimes contra a vida..."
                    className="w-full p-3.5 border-2 border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0D134C] transition"
                  />

                  {aiError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <strong className="font-bold block">Aviso do Processador:</strong>
                        <span>{aiError}</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleAIParse}
                      disabled={aiIsLoading || !aiRawText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#0D134C] hover:bg-[#1a2060] text-white text-xs font-extrabold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {aiIsLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Lendo e estruturando com a IA...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#BAFF38]" />
                          <span>{aiError ? 'Tentar Novamente com a IA' : 'Estruturar Edital com IA'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <h3 className="text-sm font-extrabold text-[#0D134C] font-['Nunito']">
                      Prévia do Edital Estruturado
                    </h3>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Órgão</span>
                        <input
                          type="text"
                          value={aiPreview.concurso || ''}
                          onChange={(e) => setAiPreview({ ...aiPreview, concurso: e.target.value })}
                          className="w-full font-bold text-gray-800 bg-white border border-gray-200 rounded px-2 py-1 mt-0.5"
                        />
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Cargo</span>
                        <input
                          type="text"
                          value={aiPreview.cargo || ''}
                          onChange={(e) => setAiPreview({ ...aiPreview, cargo: e.target.value })}
                          className="w-full font-bold text-gray-800 bg-white border border-gray-200 rounded px-2 py-1 mt-0.5"
                        />
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Banca</span>
                        <input
                          type="text"
                          value={aiPreview.banca || ''}
                          onChange={(e) => setAiPreview({ ...aiPreview, banca: e.target.value })}
                          className="w-full font-bold text-gray-800 bg-white border border-gray-200 rounded px-2 py-1 mt-0.5"
                        />
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Data da Prova</span>
                        <input
                          type="date"
                          value={aiPreview.dataProva || ''}
                          onChange={(e) => setAiPreview({ ...aiPreview, dataProva: e.target.value })}
                          className="w-full font-bold text-gray-800 bg-white border border-gray-200 rounded px-2 py-1 mt-0.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Disciplines Preview */}
                  <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-3 bg-white">
                    <div className="text-xs font-bold text-gray-600 mb-1">
                      Disciplinas identificadas ({aiPreview.disciplinas?.length || 0}):
                    </div>
                    {aiPreview.disciplinas?.map((d, i) => (
                      <div key={i} className="text-xs border-b border-gray-100 pb-2">
                        <div className="font-bold text-[#0D134C]">{d.nome}</div>
                        <div className="text-gray-500 text-[11px] pl-2 mt-0.5">
                          {d.grupos?.map((g, gi) => (
                            <span key={gi} className="inline-block mr-2 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                              {g.nome} ({g.topicos?.length || 0} tópicos)
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setAiPreview(null)}
                      className="text-xs text-gray-500 hover:text-gray-800 underline font-semibold"
                    >
                      ← Voltar e ajustar texto
                    </button>
                    <button
                      onClick={handleConfirmAIConcurso}
                      className="px-6 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmar e Salvar Novo Edital</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'novo-manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nome do Órgão / Concurso *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Tribunal de Justiça de São Paulo"
                    value={manualForm.nome}
                    onChange={(e) => setManualForm({ ...manualForm, nome: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0D134C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Cargo Desejado
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Escrevente Técnico Judiciário"
                    value={manualForm.cargo}
                    onChange={(e) => setManualForm({ ...manualForm, cargo: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0D134C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Banca Examinadora
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: VUNESP, Cebraspe, FGV, FCC"
                    value={manualForm.banca}
                    onChange={(e) => setManualForm({ ...manualForm, banca: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0D134C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Data da Prova (opcional)
                  </label>
                  <input
                    type="date"
                    value={manualForm.dataProva}
                    onChange={(e) => setManualForm({ ...manualForm, dataProva: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0D134C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Disciplinas Iniciais (1 por linha):
                </label>
                <textarea
                  rows={5}
                  value={manualForm.disciplinasRaw}
                  onChange={(e) => setManualForm({ ...manualForm, disciplinasRaw: e.target.value })}
                  placeholder="LÍNGUA PORTUGUESA&#10;RACIOCÍNIO LÓGICO&#10;DIREITO CONSTITUCIONAL"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#0D134C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('lista')}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0D134C] hover:bg-[#1a2060] text-white text-xs font-extrabold rounded-lg shadow-sm"
                >
                  Criar Edital
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
