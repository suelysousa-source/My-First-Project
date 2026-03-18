import React from 'react';
import { skillsByBimester } from '../data/skills';

interface SkillReferenceProps {
  onSelectSkill: (code: string, bimester: string) => void;
  selectedCodes: string[];
}

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14"/>
    <path d="M12 5v14"/>
  </svg>
);

const MinusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);


export const SkillReference: React.FC<SkillReferenceProps> = ({ onSelectSkill, selectedCodes }) => {
  return (
    <details className="bg-brand-surface border-4 border-brand-text rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] open:ring-brand-green transition-all">
      <summary className="p-4 cursor-pointer text-xl font-bold text-brand-text hover:bg-gray-50 flex justify-between items-center">
        Consultar Habilidades do 5º Ano (BNCC/CRMG)
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
      <div className="border-t-4 border-brand-text p-4 md:p-6 space-y-6">
        {skillsByBimester.map((bimesterData) => (
          <div key={bimesterData.bimester}>
            <h4 className="text-lg font-bold text-brand-text bg-brand-highlight px-3 py-1.5 rounded-md inline-block mb-3 border-2 border-brand-text">
              {bimesterData.bimester}
            </h4>
            <ul className="space-y-4">
              {bimesterData.skills.map((skill) => {
                const isSelected = selectedCodes.includes(skill.code);
                return (
                  <li key={skill.code} className="p-3 bg-white rounded-lg border-2 border-brand-text flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-grow mb-3 sm:mb-0 sm:mr-4">
                      <strong className="font-mono text-gray-800">{skill.code}:</strong>
                      <p className="text-gray-600 text-sm mt-1">{skill.description}</p>
                    </div>
                    <button
                      onClick={() => onSelectSkill(skill.code, bimesterData.bimester)}
                      className={`flex-shrink-0 inline-flex items-center px-3 py-1.5 border-2 border-brand-text text-xs font-bold rounded-md shadow-[2px_2px_0px_#212121] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all transform active:translate-y-px active:shadow-none ${
                        isSelected 
                          ? 'bg-red-300 text-red-800 hover:bg-red-400 focus:ring-red-400' 
                          : 'text-brand-text bg-brand-primary hover:bg-pink-300 focus:ring-brand-primary'
                      }`}
                    >
                      {isSelected ? <MinusIcon className="h-4 w-4 mr-1.5"/> : <PlusIcon className="h-4 w-4 mr-1.5"/>}
                      {isSelected ? 'Remover' : 'Usar este código'}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
};