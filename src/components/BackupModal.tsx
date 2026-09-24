import React, { useRef } from 'react';
import { useConcurso } from '../context/ConcursoContext';
import { X, Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { activeConcurso, exportData, importData, showToast } = useConcurso();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const ok = importData(json);
        if (ok) {
          onClose();
        }
      } catch (err) {
        showToast('⚠️', 'Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0D134C]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0D134C] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-[#AFE8D0]" />
            <h3 className="font-extrabold text-sm font-['Nunito'] uppercase tracking-wider">
              Backup &amp; Restauração do Progresso
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Seus dados ficam salvos com segurança no armazenamento local do seu navegador. Exporte um arquivo de backup para guardar no seu computador ou transferir seus estudos para outro dispositivo.
          </p>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Ao limpar o cache do navegador, os dados locais podem ser apagados. Mantenha sempre um backup atualizado salvo!
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => exportData(false)}
              className="w-full py-3 px-4 rounded-xl bg-[#0D134C] hover:bg-[#1a2060] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#BAFF38]" />
              <span>Exportar Todos os Concursos (.json)</span>
            </button>

            <button
              onClick={() => exportData(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#0D134C] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span>Exportar Apenas Concurso Ativo ({activeConcurso.nome})</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#0D134C] text-gray-700 hover:text-[#0D134C] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer mt-4"
            >
              <Upload className="w-4 h-4 text-[#C8102E]" />
              <span>Restaurar Backup do Arquivo (.json)</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
