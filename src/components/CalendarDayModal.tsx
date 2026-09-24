import React, { useState, useMemo } from 'react';
import { useConcurso } from '../context/ConcursoContext';
import { X, Calendar, Clock, Plus, Trash2 } from 'lucide-react';

interface CalendarDayModalProps {
  dateKey: string | null;
  onClose: () => void;
}

export const CalendarDayModal: React.FC<CalendarDayModalProps> = ({
  dateKey,
  onClose,
}) => {
  const { activeConcurso, historico, addHistorico, deleteHistorico, showToast } = useConcurso();

  const [horas, setHoras] = useState('');
  const [questoes, setQuestoes] = useState('');
  const [disc, setDisc] = useState('');
  const [tipo, setTipo] = useState('Teoria');

  const dayRegs = useMemo(() => {
    if (!dateKey) return [];
    return historico.filter(h => h.concursoId === activeConcurso.id && h.date === dateKey);
  }, [historico, activeConcurso.id, dateKey]);

  if (!dateKey) return null;

  const [y, m, d] = dateKey.split('-');
  const formattedDate = `${d}/${m}/${y}`;

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(horas) || 0;
    const q = parseInt(questoes) || 0;

    if (h === 0 && q === 0) {
      showToast('⚠️', 'Informe as horas ou questões.');
      return;
    }

    addHistorico({
      date: dateKey,
      disc: disc || 'Geral',
      topic: 'Estudo Consolidado',
      tipo,
      horas: h,
      questoes: q,
      acertos: Math.round(q * 0.7),
      erros: Math.round(q * 0.3),
      obs: '',
      origem: 'modal',
    });

    setHoras('');
    setQuestoes('');
    showToast('✅', `Sessão adicionada ao dia ${formattedDate}!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0D134C]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0D134C] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#AFE8D0]" />
            <div>
              <h3 className="font-extrabold text-sm font-['Nunito'] uppercase tracking-wider">
                Registros de {formattedDate}
              </h3>
              <p className="text-[11px] text-white/60">
                {activeConcurso.nome}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Existing records on that day */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Sessões Realizadas ({dayRegs.length})
            </h4>

            {dayRegs.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded-xl text-xs text-gray-400">
                Nenhum estudo registrado neste dia.
              </div>
            ) : (
              <div className="space-y-2">
                {dayRegs.map(r => (
                  <div
                    key={r.id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-[#0D134C]">{r.disc}</div>
                      <div className="text-[11px] text-gray-500 font-medium">
                        {r.tipo} &bull; {r.horas > 0 ? `${r.horas}h` : ''} {r.questoes > 0 ? `&bull; ${r.questoes} questões` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHistorico(r.id)}
                      className="text-gray-400 hover:text-red-600 transition p-1"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleAddSession} className="pt-4 border-t border-gray-100 space-y-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Adicionar Sessão neste Dia
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase">Horas (ex: 1.5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  value={horas}
                  onChange={(e) => setHoras(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase">Questões</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={questoes}
                  onChange={(e) => setQuestoes(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase">Disciplina</label>
              <select
                value={disc}
                onChange={(e) => setDisc(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs font-semibold"
              >
                <option value="">— Selecione —</option>
                {activeConcurso.disciplinas.map(d => (
                  <option key={d.id} value={d.nome}>{d.nome}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Fechar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0D134C] hover:bg-[#1a2060] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Salvar Sessão
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
