import React from 'react';
import { PedagogicalPrompt } from '../types';

interface SavedPromptsProps {
  prompts: PedagogicalPrompt[];
  onView: (prompt: PedagogicalPrompt) => void;
  onDelete: (promptId: string) => void;
}

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
  </svg>
);


export const SavedPrompts: React.FC<SavedPromptsProps> = ({ prompts, onView, onDelete }) => {
  if (prompts.length === 0) {
    return (
        <div className="p-6 text-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600 font-bold">Nenhuma atividade salva ainda.</p>
            <p className="text-gray-500 text-sm">Gere uma atividade e clique em "Salvar" para guardá-la aqui!</p>
        </div>
    );
  }

  return (
    <details className="bg-brand-surface border-4 border-brand-text rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all">
      <summary className="p-4 cursor-pointer text-xl font-bold text-brand-text hover:bg-gray-50 flex justify-between items-center">
        Atividades Salvas ({prompts.length})
        <span className="text-brand-text transform transition-transform duration-300 details-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </summary>
      <style>{`
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        details[open] .details-arrow { transform: rotate(180deg); }
      `}</style>
      <div className="border-t-4 border-brand-text">
        <ul className="divide-y-2 divide-gray-200">
          {prompts.map((prompt) => (
            <li key={prompt.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-brand-highlight/30 transition-colors">
              <div className="flex-grow mb-3 sm:mb-0 sm:mr-4">
                <p className="font-bold text-brand-text">{prompt.conteudoTema}</p>
                <p className="text-sm text-gray-500 font-mono mt-1">{prompt.codigoAlfanumerico}</p>
              </div>
              <div className="flex-shrink-0 flex items-center space-x-2">
                 <button
                    onClick={() => onView(prompt)}
                    className="inline-flex items-center px-3 py-1.5 border-2 border-brand-text text-xs font-bold rounded-md shadow-[2px_2px_0px_#212121] text-brand-text bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-all transform active:translate-y-px active:shadow-none"
                  >
                    <EditIcon className="h-4 w-4 mr-1.5"/>
                    Ver/Editar
                  </button>
                  <button
                    onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.')) {
                            onDelete(prompt.id!);
                        }
                    }}
                    className="inline-flex items-center p-2 border-2 border-red-800 text-xs font-medium rounded-full shadow-sm text-red-800 bg-red-200 hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                    aria-label="Excluir atividade"
                  >
                    <TrashIcon className="h-4 w-4"/>
                  </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
};