import React, { useState, useCallback, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { ResultDisplay } from './components/ResultDisplay';
import { Header } from './components/Header';
import { PedagogicalPrompt, AdaptationParams } from './types';
import { generatePedagogicalPrompt } from './services/geminiService';
import { skillsByBimester } from './data/skills';
import { SkillReference } from './components/SkillReference';
import { getSavedPrompts, savePrompt, updatePrompt, deletePrompt } from './services/storageService';
import { SavedPrompts } from './components/SavedPrompts';
import { FeedbackModal } from './components/FeedbackModal';
import { AdaptationModal } from './components/AdaptationModal';

const App: React.FC = () => {
  const [promptResult, setPromptResult] = useState<PedagogicalPrompt | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<PedagogicalPrompt[]>([]);
  
  const [bimester, setBimester] = useState<string>('1º Bimestre');
  
  const [skillCodes, setSkillCodes] = useState<string[]>([]);

  const [classCount, setClassCount] = useState<string>('1');
  const [theme, setTheme] = useState<string>('');
  const [classType, setClassType] = useState<string>('Aula Híbrida');
  
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isAdaptationModalOpen, setIsAdaptationModalOpen] = useState(false);

  useEffect(() => {
    setSavedPrompts(getSavedPrompts());
  }, []);

  useEffect(() => {
    // When a new result is generated or viewed, scroll to it smoothly.
    if (promptResult) {
      // A small timeout ensures the component has rendered before we scroll.
      const timer = setTimeout(() => {
        const resultElement = document.getElementById('result-display');
        resultElement?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [promptResult]);

  const handleBimesterChange = (newBimester: string) => {
    setBimester(newBimester);
    setSkillCodes([]); // Clear selected skills when bimester changes
  };

  const handleSelectSkill = (code: string, bimesterName: string) => {
    setBimester(bimesterName);
    // Toggle skill selection
    setSkillCodes(prevCodes => 
      prevCodes.includes(code) 
        ? prevCodes.filter(c => c !== code) 
        : [...prevCodes, code]
    );
    document.getElementById('input-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


  const handleGeneratePrompt = useCallback(async (adaptationParams?: AdaptationParams) => {
    setIsLoading(true);
    setError(null);
    setPromptResult(null);
    
    // If we were called from the modal, close it
    if (adaptationParams) {
        setIsAdaptationModalOpen(false);
    }

    try {
      if (skillCodes.length === 0) {
        throw new Error("Selecione pelo menos uma habilidade.");
      }
      const result = await generatePedagogicalPrompt(
          skillCodes, 
          bimester, 
          classCount, 
          theme, 
          classType,
          adaptationParams // Pass optional adaptation params
      );
      setPromptResult(result);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      console.error("Error generating prompt:", errorMessage);
      setError(`Falha ao gerar o prompt. Verifique as habilidades selecionadas e tente novamente. Detalhes: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [skillCodes, bimester, classCount, theme, classType]);

  const handleSaveNewPrompt = (promptToSave: PedagogicalPrompt) => {
    const updatedPrompts = savePrompt(promptToSave);
    setSavedPrompts(updatedPrompts);
    const newlySavedPrompt = updatedPrompts.find(p => p.id === promptToSave.id);
    if(newlySavedPrompt) setPromptResult(newlySavedPrompt);
  };

  const handleUpdateSavedPrompt = (promptToUpdate: PedagogicalPrompt) => {
    const updatedPrompts = updatePrompt(promptToUpdate);
    setSavedPrompts(updatedPrompts);
  };

  const handleDeleteSavedPrompt = (promptId: string) => {
    if (promptResult?.id === promptId) {
        setPromptResult(null);
    }
    const updatedPrompts = deletePrompt(promptId);
    setSavedPrompts(updatedPrompts);
  };

  const handleViewSavedPrompt = (prompt: PedagogicalPrompt) => {
    setPromptResult(prompt);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <p className="text-xl text-gray-700">
              Gere uma atividade de matemática completa e criativa para sua turma do 5º ano.
            </p>
          </div>

          <SkillReference onSelectSkill={handleSelectSkill} selectedCodes={skillCodes} />
          
          <InputForm
            skillCodes={skillCodes}
            setSkillCodes={setSkillCodes}
            bimester={bimester}
            setBimester={handleBimesterChange}
            allSkillsByBimester={skillsByBimester}
            onGenerate={() => handleGeneratePrompt()} // Standard generation
            onOpenAdaptationModal={() => setIsAdaptationModalOpen(true)} // Open adaptation modal
            isLoading={isLoading}
            classCount={classCount}
            setClassCount={setClassCount}
            theme={theme}
            setTheme={setTheme}
            classType={classType}
            setClassType={setClassType}
          />
          
          <SavedPrompts
            prompts={savedPrompts}
            onView={handleViewSavedPrompt}
            onDelete={handleDeleteSavedPrompt}
          />
          
          {error && (
             <div className="p-4 bg-red-200 border-2 border-red-500 text-red-800 rounded-lg shadow-lg font-bold" role="alert">
              <strong className="font-bold">Oops! Algo deu errado: </strong>
              <span className="block sm:inline mt-2">{error}</span>
            </div>
          )}

          <ResultDisplay 
            result={promptResult} 
            isLoading={isLoading}
            onSaveNew={handleSaveNewPrompt}
            onUpdate={handleUpdateSavedPrompt}
          />
        </div>
      </main>
      <footer className="text-center p-4 mt-12 text-brand-text bg-brand-primary border-t-4 border-brand-text">
        <p>
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="underline hover:text-gray-700 font-bold"
          >
            Clique aqui para deixar sugestões ou relatar erros
          </button>
        </p>
        <p className="mt-2 text-sm">Desenvolvido com a tecnologia da API Gemini.</p>
        <p className="text-sm">As atividades são sugestões e devem ser adaptadas à realidade de cada turma.</p>
      </footer>
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
      <AdaptationModal
        isOpen={isAdaptationModalOpen}
        onClose={() => setIsAdaptationModalOpen(false)}
        onConfirm={handleGeneratePrompt}
        isLoading={isLoading}
      />
    </div>
  );
};

export default App;
