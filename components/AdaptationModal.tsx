import React, { useState } from 'react';
import { AdaptationParams } from '../types';

interface AdaptationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: AdaptationParams) => void;
  isLoading: boolean;
}

const transtornos = [
  "Transtorno do Espectro Autista (TEA)",
  "Transtorno do Déficit de Atenção com Hiperatividade (TDAH)",
  "Transtorno Específico da Aprendizagem (Dislexia/Discalculia)",
  "Deficiência Intelectual (DI)",
  "Outro"
];

const niveisSuporte = [
  "Nível 1 - Requer Suporte",
  "Nível 2 - Requer Suporte Substancial",
  "Nível 3 - Requer Suporte Muito Substancial"
];

export const AdaptationModal: React.FC<AdaptationModalProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [transtorno, setTranstorno] = useState<string>(transtornos[0]);
  const [nivelSuporte, setNivelSuporte] = useState<string>(niveisSuporte[0]);
  const [detalhesOutro, setDetalhesOutro] = useState<string>('');
  const [conteudo, setConteudo] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      transtorno,
      nivelSuporte,
      detalhesOutro: transtorno === 'Outro' ? detalhesOutro : undefined,
      conteudo: conteudo.trim() !== '' ? conteudo : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-brand-surface border-4 border-brand-text rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 md:p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          disabled={isLoading}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          aria-label="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <h2 className="text-2xl font-bold text-brand-text mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-brand-accent">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
            <path d="M8.5 8.5v.01"></path>
            <path d="M16 15.5v.01"></path>
            <path d="M12 12v.01"></path>
            <path d="M11 17a2 2 0 0 1 2 2"></path>
          </svg>
          Atividade Adaptada
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Personalize a atividade para alunos com Transtornos do Neurodesenvolvimento e necessidades específicas de suporte.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Transtorno */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              1. Transtorno / Condição <span className="text-red-500">*</span>
            </label>
            <select
              value={transtorno}
              onChange={(e) => setTranstorno(e.target.value)}
              className="w-full px-3 py-2 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent bg-white transition"
            >
              {transtornos.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {transtorno === 'Outro' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Especifique o transtorno ou condição: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={detalhesOutro}
                onChange={(e) => setDetalhesOutro(e.target.value)}
                placeholder="Ex: T.O.D., Síndrome de Down, etc."
                className="w-full px-3 py-2 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent bg-white transition"
                required
              />
            </div>
          )}

          {/* Nível de Suporte */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              2. Nível de Suporte (Baseado no DSM-5) <span className="text-red-500">*</span>
            </label>
            <select
              value={nivelSuporte}
              onChange={(e) => setNivelSuporte(e.target.value)}
              className="w-full px-3 py-2 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent bg-white transition"
            >
              {niveisSuporte.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Habilidade/Conteúdo Específico */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              3. Habilidade/Conteúdo Curricular (Foco da Adaptação)
            </label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder='Ex: "Conjugar verbos no presente do indicativo" ou "Resolver problemas de subtração com reagrupamento"'
              className="w-full px-3 py-2 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent bg-white transition"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Descreva o foco específico para guiar a adaptação da IA.
            </p>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
             <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border-2 border-transparent text-sm font-bold text-gray-600 hover:text-black disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-6 py-2 border-2 border-brand-text text-base font-bold rounded-lg shadow-[4px_4px_0px_#212121] hover:shadow-[2px_2px_0px_#212121] active:shadow-none text-brand-text bg-brand-accent hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transform hover:-translate-y-px active:translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                   <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-brand-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gerando Adaptação...
                </>
              ) : (
                "Gerar Atividade ADAPTADA"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};