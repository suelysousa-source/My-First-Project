import React from 'react';
import { BimesterSkills } from '../data/skills';

interface InputFormProps {
  skillCodes: string[];
  setSkillCodes: (value: string[]) => void;
  bimester: string;
  setBimester: (value:string) => void;
  allSkillsByBimester: BimesterSkills[];
  onGenerate: () => void;
  onOpenAdaptationModal: () => void; // New prop
  isLoading: boolean;
  classCount: string;
  setClassCount: (value: string) => void;
  theme: string;
  setTheme: (value: string) => void;
  classType: string;
  setClassType: (value: string) => void;
}

const GenerateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const AdaptationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
    <path d="M8.5 8.5v.01"></path>
    <path d="M16 15.5v.01"></path>
    <path d="M12 12v.01"></path>
    <path d="M11 17a2 2 0 0 1 2 2"></path>
  </svg>
);

const classTypeOptions = [
  'Aula Híbrida', 
  'Aula Prática com material concreto', 
  'Aula Teórica', 
  'Gamificação', 
  'Resolução de Problemas', 
  'Sala de Aula Invertida'
];

const classCountOptions = ['1', '2', '3', '4', '5'];

export const InputForm: React.FC<InputFormProps> = ({ 
  skillCodes, 
  setSkillCodes, 
  bimester, 
  setBimester, 
  allSkillsByBimester,
  onGenerate, 
  onOpenAdaptationModal,
  isLoading,
  classCount,
  setClassCount,
  theme,
  setTheme,
  classType,
  setClassType,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  const handleSkillToggle = (code: string) => {
    const newSelection = skillCodes.includes(code)
      ? skillCodes.filter(c => c !== code)
      : [...skillCodes, code];
    setSkillCodes(newSelection);
  };

  const currentBimesterSkills = allSkillsByBimester.find(b => b.bimester === bimester)?.skills || [];

  return (
    <form id="input-form" onSubmit={handleSubmit} className="p-6 md:p-8 bg-brand-surface border-4 border-brand-text rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-8">
      {/* Bimester Selection */}
      <div>
        <label className="block text-lg font-bold text-brand-text mb-3">
          1. Selecione o Bimestre
        </label>
        <div className="flex flex-wrap gap-3">
          {allSkillsByBimester.map((bimesterGroup) => (
            <button
              key={bimesterGroup.bimester}
              type="button"
              onClick={() => setBimester(bimesterGroup.bimester)}
              className={`px-4 py-2 text-sm rounded-lg border-2 font-bold transition-all transform hover:scale-105 ${
                bimester === bimesterGroup.bimester
                  ? 'bg-brand-green text-brand-text border-brand-text shadow-[2px_2px_0px_#212121]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-brand-highlight hover:border-brand-text'
              }`}
            >
              {bimesterGroup.bimester}
            </button>
          ))}
        </div>
      </div>
      
      {/* Skill Selection */}
      <div>
        <label className="block text-lg font-bold text-brand-text mb-3">
          2. Selecione a Habilidade (uma ou mais)
        </label>
        <div className="max-h-60 overflow-y-auto space-y-3 rounded-xl border-2 border-brand-text p-4 bg-gray-50">
          {currentBimesterSkills.length > 0 ? (
            currentBimesterSkills.map(skill => (
              <label key={skill.code} className="flex items-start p-3 rounded-lg hover:bg-brand-highlight/50 bg-white border-2 border-brand-text cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={skillCodes.includes(skill.code)}
                  onChange={() => handleSkillToggle(skill.code)}
                  className="h-5 w-5 rounded border-gray-400 text-brand-green focus:ring-brand-green mt-1 flex-shrink-0"
                />
                <div className="ml-3 text-sm">
                  <p className="font-bold text-gray-900">{skill.code}</p>
                  <p className="text-gray-600">{skill.description}</p>
                </div>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center p-4">Nenhuma habilidade encontrada para este bimestre.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Class Count */}
        <div>
          <label className="block text-lg font-bold text-brand-text mb-3">
            3. Quantidade de Aulas
          </label>
          <div className="flex flex-wrap gap-3">
            {classCountOptions.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setClassCount(count)}
                className={`w-12 h-12 rounded-lg border-2 font-bold transition-all transform hover:scale-105 ${
                  classCount === count
                    ? 'bg-brand-green text-brand-text border-brand-text shadow-[2px_2px_0px_#212121]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-brand-highlight hover:border-brand-text'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
        {/* Theme */}
        <div>
          <label htmlFor="theme" className="block text-lg font-bold text-brand-text mb-3">
            4. Tema (Opcional)
          </label>
          <input
            type="text"
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full px-4 py-2 border-2 border-brand-text rounded-lg shadow-sm focus:ring-brand-green focus:border-brand-green bg-white transition"
            placeholder="Ex: Jogos Olímpicos"
          />
        </div>
      </div>
      
      {/* Class Type */}
      <div>
        <label className="block text-lg font-bold text-brand-text mb-3">
          5. Tipo de Aula
        </label>
        <div className="flex flex-wrap gap-3">
          {classTypeOptions.map((type) => (
             <button
              key={type}
              type="button"
              onClick={() => setClassType(type)}
              className={`px-4 py-2 text-sm rounded-lg border-2 font-bold transition-all transform hover:scale-105 ${
                classType === type
                  ? 'bg-brand-green text-brand-text border-brand-text shadow-[2px_2px_0px_#212121]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-brand-highlight hover:border-brand-text'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 pt-4 justify-end">
        
        {/* Adapted Activity Button */}
        <button
          type="button"
          onClick={onOpenAdaptationModal}
          disabled={isLoading || skillCodes.length === 0}
          className="inline-flex items-center justify-center px-6 py-3 border-2 border-brand-text text-lg font-bold rounded-lg shadow-[4px_4px_0px_#212121] hover:shadow-[2px_2px_0px_#212121] active:shadow-none text-brand-text bg-brand-accent hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-px active:translate-y-px transition-all w-full md:w-auto"
        >
          <AdaptationIcon className="h-6 w-6 mr-2" />
          Gerar atividade ADAPTADA
        </button>

        {/* Standard Activity Button */}
        <button
          type="submit"
          disabled={isLoading || skillCodes.length === 0}
          className="inline-flex items-center justify-center px-8 py-3 border-2 border-brand-text text-lg font-bold rounded-lg shadow-[4px_4px_0px_#212121] hover:shadow-[2px_2px_0px_#212121] active:shadow-none text-brand-text bg-brand-primary hover:bg-pink-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-px active:translate-y-px transition-all w-full md:w-auto"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Gerando...
            </>
          ) : (
            <>
              <GenerateIcon className="h-6 w-6 mr-2" />
              Gerar Atividade
            </>
          )}
        </button>
      </div>
    </form>
  );
};