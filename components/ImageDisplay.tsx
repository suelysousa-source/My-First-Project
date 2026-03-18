import React, { useState, useEffect, useCallback } from 'react';
import { generateImageFromPrompt } from '../services/geminiService';

interface ImageDisplayProps {
  initialPrompt: string;
  onPromptChange: (newPrompt: string) => void;
  onImageGenerated: (imageUrl: string | null) => void;
  showEditor?: boolean;
}

const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
);

const GenerateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);


export const ImageDisplay: React.FC<ImageDisplayProps> = ({ initialPrompt, onPromptChange, onImageGenerated, showEditor = true }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>(initialPrompt);

  const generateImage = useCallback(async (promptToGenerate: string) => {
    if (!promptToGenerate) {
        setIsLoading(false);
        setError("Nenhuma descrição de imagem fornecida.");
        return;
    };

    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    onImageGenerated(null);

    try {
      const url = await generateImageFromPrompt(promptToGenerate);
      setImageUrl(url);
      onImageGenerated(url);
    } catch (err) {
      setError('Não foi possível gerar a imagem.');
      onImageGenerated(null);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [onImageGenerated]);

  useEffect(() => {
    setCurrentPrompt(initialPrompt);
    generateImage(initialPrompt);
  }, [initialPrompt, generateImage]);
  
  const handleGenerateClick = () => {
    generateImage(currentPrompt);
    onPromptChange(currentPrompt);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <ImageIcon className="w-16 h-16 mb-4 animate-pulse" />
          <p className="font-semibold">Gerando imagem para a atividade...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-500">
           <ImageIcon className="w-16 h-16 mb-4" />
          <p className="font-semibold">{error}</p>
        </div>
      );
    }

    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={currentPrompt} 
          className="w-full h-full object-cover rounded-md transition-opacity duration-500 opacity-100"
        />
      );
    }

    return null;
  };

  return (
    <div>
        <div className="relative aspect-video w-full bg-gray-100 rounded-lg shadow-inner border-2 border-brand-text flex items-center justify-center overflow-hidden">
            {renderContent()}
        </div>
        {showEditor && (
            <div className="mt-4 p-4 bg-brand-highlight/50 border-2 border-brand-text rounded-lg animate-fade-in">
                <label htmlFor="image-prompt-input" className="block text-sm font-bold text-gray-700 mb-2">
                Descrição para gerar nova imagem (em português)
                </label>
                <div className="flex items-center space-x-2">
                <textarea
                    id="image-prompt-input"
                    rows={2}
                    value={currentPrompt}
                    onChange={(e) => setCurrentPrompt(e.target.value)}
                    placeholder="Digite a descrição da imagem desejada..."
                    className="flex-grow w-full px-3 py-2 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green bg-white transition"
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerateClick}
                    disabled={isLoading || !currentPrompt}
                    className="inline-flex items-center justify-center px-4 py-2 border-2 border-brand-text text-sm font-bold rounded-lg shadow-[2px_2px_0px_#212121] text-brand-text bg-brand-green hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all self-start"
                >
                    {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-brand-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Gerando...
                    </>
                    ) : (
                    <>
                        <GenerateIcon className="h-4 w-4 mr-2" />
                        Gerar
                    </>
                    )}
                </button>
                </div>
            </div>
        )}
    </div>
  );
};