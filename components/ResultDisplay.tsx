import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PedagogicalPrompt } from '../types';
import { ImageDisplay } from './ImageDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { generatePdf, generateDocx, generatePng, generateJpg } from '../services/documentGenerator';
import { createCanvaPresentation } from '../services/slideshowGenerator';
import { ShareModal } from './ShareModal';


interface ResultDisplayProps {
  result: PedagogicalPrompt | null;
  isLoading: boolean;
  onSaveNew: (prompt: PedagogicalPrompt) => void;
  onUpdate: (prompt: PedagogicalPrompt) => void;
}

const SpeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </svg>
);

const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
  </svg>
);

const AdaptationHeaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
    <path d="M8.5 8.5v.01"></path>
    <path d="M16 15.5v.01"></path>
    <path d="M12 12v.01"></path>
    <path d="M11 17a2 2 0 0 1 2 2"></path>
  </svg>
);

const SpeechButton: React.FC<{ textToSpeak: string }> = ({ textToSpeak }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis?.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
        return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Cancel any previous speech before starting a new one
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'pt-BR';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };
  
  // A listener to update state if speech is cancelled from another source
  // e.g., another play button is pressed.
  useEffect(() => {
      const onSpeechEnd = () => {
          if (isSpeaking) {
              setIsSpeaking(false);
          }
      };
      
      // We can use an interval as a fallback because onend is not always reliable
      const interval = setInterval(() => {
          if (!window.speechSynthesis.speaking && isSpeaking) {
              setIsSpeaking(false);
          }
      }, 250);

      return () => {
          clearInterval(interval);
      };
  }, [isSpeaking]);


  if (!('speechSynthesis' in window)) {
    return null;
  }

  return (
    <button 
      onClick={handleToggleSpeech} 
      disabled={!textToSpeak}
      className={`flex items-center justify-center space-x-2 px-3 py-1.5 text-sm font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 ${
        isSpeaking 
        ? 'bg-red-500 text-white border-red-700 focus:ring-red-400' 
        : 'bg-white text-brand-text border-brand-text hover:bg-gray-100 focus:ring-brand-green disabled:bg-gray-200'
      }`}
    >
      {isSpeaking ? <StopIcon/> : <SpeakerIcon/>}
      <span>{isSpeaking ? 'Parar' : 'Ouvir'}</span>
    </button>
  );
};


const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <button 
      onClick={handleCopy} 
      className={`flex items-center justify-center space-x-2 px-3 py-1.5 text-sm font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 ${
        isCopied 
        ? 'bg-green-500 text-white border-green-700 focus:ring-green-400' 
        : 'bg-white text-brand-text border-brand-text hover:bg-gray-100 focus:ring-brand-green'
      }`}
    >
      {isCopied ? <CheckIcon/> : <ClipboardIcon/>}
      <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
    </button>
  );
};


const ResultSection: React.FC<{ title: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode; className?: string }> = ({ title, children, actions, className }) => (
  <div className={`mb-6 ${className || ''}`}>
    <div className="flex justify-between items-center bg-brand-highlight text-brand-text px-4 py-2 rounded-t-lg border-b-2 border-brand-text">
      <h3 className="text-lg font-bold flex items-center gap-2">{title}</h3>
      {actions && <div>{actions}</div>}
    </div>
    <div className="p-4 bg-white rounded-b-lg border-x-2 border-b-2 border-brand-text">
        {children}
    </div>
  </div>
);

const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
  </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

const YouTubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className="text-red-600">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 6 7.5 4 12 4s9.5 2 9.5 3-2.5 3-2.5 3.5 1 2.5 1 3c0 .5-1.5 1.5-1.5 2C18 19.5 12 22 12 22s-9.5-2.5-9.5-5Z"/>
        <path d="M9.5 15.5 15 12l-5.5-3.5Z"/>
    </svg>
);

const SaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
);

const CanvaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.05 15.6c-2.43 0-4.4-1.97-4.4-4.4s1.97-4.4 4.4-4.4c2.43 0 4.4 1.97 4.4 4.4s-1.97 4.4-4.4 4.4zm2.1-6.15c-.2-.14-.46-.22-.73-.22-.55 0-1.01.28-1.29.68-.31.45-.44.99-.41 1.54.03.55.26 1.06.66 1.41.41.35.95.55 1.51.55.28 0 .56-.08.8-.23.63-.39 1.03-1.06 1.03-1.8s-.4-1.41-1.07-1.79zm-4.32-.01c-.2-.14-.46-.22-.73-.22-.55 0-1.01.28-1.29.68-.31.45-.44.99-.41 1.54.03.55.26 1.06.66 1.41.41.35.95.55 1.51.55.28 0 .56-.08.8-.23.63-.39 1.03-1.06 1.03-1.8s-.4-1.41-1.07-1.8z"/>
  </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const AccessibilityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
        <path d="M12 2a10 10 0 0 0-10 10c0 4.42 2.87 8.17 6.84 9.5" />
        <path d="M17.16 21.5A10 10 0 0 0 22 12" />
    </svg>
);

const LibrasIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-4a2 2 0 1 1 0-4h4a4 4 0 1 0 0-8Z"/>
    </svg>
);

const EyeOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
        <path d="m2 2 20 20"/>
    </svg>
);

const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
);

const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
);

const DownloadButton: React.FC<{ onDownload: (format: 'pdf' | 'docx' | 'png' | 'jpg') => void; isDownloading: boolean }> = ({ onDownload, isDownloading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDownload = (format: 'pdf' | 'docx' | 'png' | 'jpg') => {
        onDownload(format);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isDownloading}
                    className="inline-flex items-center justify-center w-full rounded-lg border-2 border-brand-text shadow-[2px_2px_0px_#212121] active:shadow-none px-4 py-2 bg-white text-sm font-bold text-brand-text hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:bg-gray-300 disabled:cursor-not-allowed transform active:translate-y-px"
                >
                    {isDownloading ? (
                         <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Baixando...
                        </>
                    ) : (
                        <>
                            <DownloadIcon className="h-5 w-5 mr-2" />
                            Download
                        </>
                    )}
                </button>
            </div>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-2 ring-brand-text z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleDownload('pdf'); }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-highlight hover:text-brand-text font-bold"
                            role="menuitem"
                        >
                            Baixar PDF
                        </a>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleDownload('docx'); }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-highlight hover:text-brand-text font-bold"
                            role="menuitem"
                        >
                            Baixar DOCX (Word)
                        </a>
                         <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleDownload('png'); }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-highlight hover:text-brand-text font-bold"
                            role="menuitem"
                        >
                            Baixar Imagem (PNG)
                        </a>
                         <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleDownload('jpg'); }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-highlight hover:text-brand-text font-bold"
                            role="menuitem"
                        >
                            Baixar Imagem (JPG)
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading, onSaveNew, onUpdate }) => {
  const [editableResult, setEditableResult] = useState<PedagogicalPrompt | null>(result);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const hasChanges = useMemo(() => {
    if (!result || !editableResult) return false;
    return JSON.stringify(result) !== JSON.stringify(editableResult);
  }, [result, editableResult]);
  
  useEffect(() => {
    setEditableResult(result);
    setSaveStatus('idle');
  }, [result]);

  const handleFieldChange = (field: keyof PedagogicalPrompt, value: any) => {
    if (!editableResult) return;
    setEditableResult(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleNestedFieldChange = (
      field: keyof PedagogicalPrompt,
      nestedField: string,
      value: string
  ) => {
      if (!editableResult) return;
      setEditableResult(prev => {
          if (!prev) return null;
          const updatedField = { ...(prev[field] as object), [nestedField]: value };
          return { ...prev, [field]: updatedField };
      });
  };

  const handleSave = () => {
    if (!editableResult) return;
    if (editableResult.id) {
        onUpdate(editableResult);
    } else {
        onSaveNew({ ...editableResult, id: `prompt_${Date.now()}` });
    }
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };
  
  const handleCanvaGeneration = () => {
    if (!editableResult) return;
    setIsGeneratingSlides(true);
    try {
        const canvaUrl = createCanvaPresentation(editableResult);
        window.open(canvaUrl, '_blank');
    } catch (error) {
        console.error("Failed to create Canva presentation link:", error);
    } finally {
        // This is a quick operation, so we can turn off the loading state almost immediately
        setIsGeneratingSlides(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx' | 'png' | 'jpg') => {
    if (!editableResult) return;
    setIsDownloading(true);
    try {
        let blob: Blob | null = null;
        if (format === 'pdf') {
            blob = await generatePdf(editableResult, generatedImageUrl);
        } else if (format === 'docx') {
            blob = await generateDocx(editableResult, generatedImageUrl);
        } else if (format === 'png') {
            blob = await generatePng(editableResult, generatedImageUrl);
        } else if (format === 'jpg') {
            blob = await generateJpg(editableResult, generatedImageUrl);
        }
        if (blob) {
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    } catch (error) {
        console.error(`Failed to generate ${format}:`, error);
    } finally {
        setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!result || !editableResult) {
    return null;
  }

  const isSaved = !!editableResult.id;
  const isAdapted = !!editableResult.adaptacao;

  return (
    <div id="result-display" className="mt-8 p-6 md:p-8 bg-brand-surface border-4 border-brand-text rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-4 border-b-4 border-dashed border-gray-300">
            <h2 className="text-3xl font-bold text-brand-text text-center sm:text-left mb-4 sm:mb-0 flex items-center">
                {isAdapted ? (
                   <>
                    <AdaptationHeaderIcon className="w-8 h-8 mr-2 text-brand-accent"/>
                    Atividade Adaptada (DUA)
                   </>
                ) : (
                  isSaved ? "Atividade Salva" : "Proposta Pedagógica Gerada"
                )}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-start sm:justify-end w-full sm:w-auto">
                <DownloadButton onDownload={handleDownload} isDownloading={isDownloading} />
                <button
                    onClick={handleCanvaGeneration}
                    disabled={isGeneratingSlides}
                    className="inline-flex items-center justify-center px-4 py-2 border-2 border-brand-text text-sm font-bold rounded-lg shadow-[2px_2px_0px_#212121] text-brand-text bg-brand-accent hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transform active:translate-y-px active:shadow-none transition-all"
                >
                    {isGeneratingSlides ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Abrindo...
                        </>
                    ) : (
                        <>
                            <CanvaIcon className="h-5 w-5 mr-2" />
                            Criar no Canva
                        </>
                    )}
                </button>
                <button
                    onClick={handleSave}
                    disabled={(isSaved && !hasChanges) || saveStatus === 'saved'}
                    className={`inline-flex items-center justify-center px-4 py-2 border-2 border-brand-text text-sm font-bold rounded-lg shadow-[2px_2px_0px_#212121] transform active:translate-y-px active:shadow-none transition-all ${
                        saveStatus === 'saved' ? 'bg-green-500 text-white' : 'bg-brand-primary text-brand-text hover:bg-pink-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed'
                    }`}
                >
                    <SaveIcon className="h-5 w-5 mr-2" />
                    {saveStatus === 'saved' ? 'Salvo!' : (isSaved ? 'Salvar Alterações' : 'Salvar')}
                </button>
                <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 border-2 border-brand-text text-sm font-bold rounded-lg shadow-[2px_2px_0px_#212121] text-brand-text bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transform active:translate-y-px active:shadow-none transition-all"
                >
                    <ShareIcon className="h-5 w-5 mr-2" />
                    Compartilhar
                </button>
            </div>
        </div>

      {editableResult.sugestaoDeImagem && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h3 className="text-2xl font-bold text-brand-text">Ilustração da Atividade</h3>
            <button 
              onClick={() => setShowImagePrompt(!showImagePrompt)}
              className={`inline-flex items-center px-4 py-2 border-2 border-brand-text rounded-lg font-bold text-sm shadow-[2px_2px_0px_#212121] active:shadow-none active:translate-y-px transition-all ${
                showImagePrompt ? 'bg-gray-200' : 'bg-white hover:bg-brand-highlight'
              }`}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {showImagePrompt ? 'Ocultar Editor' : 'Re-gerar com nova descrição'}
            </button>
          </div>
          <ImageDisplay 
            initialPrompt={editableResult.sugestaoDeImagem} 
            onPromptChange={(newPrompt) => handleFieldChange('sugestaoDeImagem', newPrompt)}
            onImageGenerated={setGeneratedImageUrl}
            showEditor={showImagePrompt}
          />
        </div>
      )}

      {isAdapted && editableResult.adaptacao && (
        <div className="mb-8 bg-blue-50 border-2 border-brand-accent rounded-lg p-6">
           <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center">
             <AdaptationHeaderIcon className="w-6 h-6 mr-2"/>
             Estratégias de Inclusão e Adaptação
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <p className="font-bold text-sm text-gray-500 uppercase">Perfil do Aluno</p>
                <p className="text-lg font-bold">{editableResult.adaptacao.transtorno}</p>
                <p className="text-md text-gray-700">{editableResult.adaptacao.nivelSuporte}</p>
             </div>
             <div>
               <p className="font-bold text-sm text-gray-500 uppercase">Critérios de Sucesso</p>
               <p className="text-gray-700 italic">{editableResult.adaptacao.criteriosSucesso}</p>
             </div>
           </div>
           <div className="mt-4">
              <p className="font-bold text-sm text-gray-500 uppercase mb-2">Estratégias Aplicadas</p>
              <ul className="list-disc list-inside space-y-2">
                {editableResult.adaptacao.estrategias.map((est, idx) => (
                  <li key={idx} className="text-gray-800 bg-white p-2 rounded border border-gray-200">{est}</li>
                ))}
              </ul>
           </div>
        </div>
      )}

      <ResultSection title="Código Alfanumérico">
        <p className="text-gray-700 font-mono text-lg">{editableResult.codigoAlfanumerico}</p>
      </ResultSection>

      <ResultSection title="Habilidade (BNCC/CRMG)">
        <p className="text-gray-700 italic whitespace-pre-wrap">{editableResult.habilidade}</p>
      </ResultSection>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <ResultSection title={isAdapted ? "Nome da Atividade Adaptada" : "Conteúdo e Tema"}>
           <input
             type="text"
             value={editableResult.conteudoTema}
             onChange={(e) => handleFieldChange('conteudoTema', e.target.value)}
             className="w-full px-3 py-2 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green bg-white transition"
           />
        </ResultSection>
        <ResultSection title="Quantidade de Aulas">
          <p className="text-gray-700">{editableResult.quantidadeAulas}</p>
        </ResultSection>
      </div>

      <ResultSection title={isAdapted ? "Objetivo(s) Curricular(es)" : "Objeto(s) de Conhecimento"}>
        <ul className="list-disc list-inside space-y-1">
          {editableResult.objetosDeConhecimento.map((obj, index) => (
            <li key={index} className="text-gray-700">{obj}</li>
          ))}
        </ul>
      </ResultSection>
      
      <ResultSection 
        title={isAdapted ? "Plano de Aula e Perfil do Aluno" : "Plano de Aula (ATIVIDADE)"}
        actions={<CopyButton textToCopy={editableResult.planoDeAula}/>}
      >
        <textarea
          value={editableResult.planoDeAula}
          onChange={(e) => handleFieldChange('planoDeAula', e.target.value)}
          className="w-full h-96 p-3 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green bg-white transition prose prose-blue max-w-none text-brand-text"
          aria-label="Plano de Aula Editável"
        />
      </ResultSection>
      
      <ResultSection 
        title={isAdapted ? "Atividade Adaptada (Para Impressão)" : "Folha de Atividades (Para Impressão)"}
        actions={<CopyButton textToCopy={editableResult.folhaDeAtividades}/>}
      >
        <textarea
          value={editableResult.folhaDeAtividades}
          onChange={(e) => handleFieldChange('folhaDeAtividades', e.target.value)}
          className="w-full h-96 p-3 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green bg-white transition prose prose-blue max-w-none text-brand-text"
          aria-label="Folha de Atividades Editável"
        />
      </ResultSection>

      {editableResult.passoAPassoProfessor && (
        <ResultSection 
          title="Passo a Passo para o Professor"
          actions={<CopyButton textToCopy={editableResult.passoAPassoProfessor}/>}
        >
          <textarea
            value={editableResult.passoAPassoProfessor}
            onChange={(e) => handleFieldChange('passoAPassoProfessor', e.target.value)}
            className="w-full h-64 p-3 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green bg-white transition prose prose-blue max-w-none text-brand-text"
            aria-label="Passo a Passo Editável"
          />
        </ResultSection>
      )}

      <ResultSection title="Tipo de Aula e Materiais">
        <p className="text-brand-text font-bold">{editableResult.tipoDeAula.tipo}</p>
        {editableResult.tipoDeAula.materiais && editableResult.tipoDeAula.materiais.length > 0 && (
          <>
            <p className="text-sm text-gray-600 mt-2 mb-1 font-bold">Material por estudante:</p>
            <ul className="list-disc list-inside space-y-1 bg-gray-50 p-3 rounded-md border-2 border-gray-200">
              {editableResult.tipoDeAula.materiais.map((material, index) => (
                <li key={index} className="text-gray-700">{material}</li>
              ))}
            </ul>
          </>
        )}
      </ResultSection>
      
      <ResultSection title="Sugestão de Avaliação">
        <p className="text-gray-700">{editableResult.sugestaoAvaliacao}</p>
      </ResultSection>
      
      <div className="mt-8 pt-6 border-t-4 border-dashed border-gray-300">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Ferramentas para o Professor</h3>
        <div className="space-y-6">

          <ResultSection title="Para o Diário Online">
            <div className="flex items-center space-x-4 bg-gray-100 p-3 rounded-md border-2 border-gray-200">
              <p className="text-gray-700 font-mono flex-grow text-sm">{editableResult.diarioDeClasse}</p>
              <CopyButton textToCopy={editableResult.diarioDeClasse} />
            </div>
          </ResultSection>

          <ResultSection title="Sugestão de Vídeo Aula (YouTube)">
            <div className="flex items-center space-x-3">
                <YouTubeIcon />
                <p className="text-gray-700">
                  Busque por: <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(editableResult.sugestaoVideoAula)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">{editableResult.sugestaoVideoAula}</a>
                </p>
            </div>
          </ResultSection>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t-4 border-dashed border-gray-300">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
            <AccessibilityIcon className="h-6 w-6 mr-2" />
            Recursos de Acessibilidade
        </h3>
        <div className="space-y-6">
            <ResultSection 
              title={
                <>
                  <LibrasIcon className="h-6 w-6" />
                  Acessibilidade em LIBRAS
                </>
              }
            >
              <div className="bg-blue-100 border-2 border-blue-400 text-blue-800 p-4 rounded-lg space-y-2">
                <p className="font-bold">Tradução automática para LIBRAS ativada!</p>
                <p className="text-sm">
                  Utilize o widget <strong className="font-bold">VLibras</strong> (o ícone de mãos azuis no canto da tela) para traduzir automaticamente o texto da atividade para a Língua Brasileira de Sinais.
                </p>
                <div className="pt-2">
                  <a 
                    href={`https://www.google.com/search?q=LIBRAS+${encodeURIComponent(editableResult.conteudoTema || editableResult.folhaDeAtividades.split('\n')[0].replace(/#/g, '').trim())}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-white border-2 border-blue-600 text-blue-800 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-[2px_2px_0px_#2563eb] active:shadow-none active:translate-y-px"
                  >
                    <LibrasIcon className="w-5 h-5 mr-2" />
                    Buscar sinais em LIBRAS no Google
                  </a>
                </div>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-bold text-gray-600 hover:text-black">
                  Mostrar/Ocultar roteiro para intérprete
                </summary>
                <div className="mt-2 relative">
                  <textarea
                    value={editableResult.sugestaoVideoLibras}
                    onChange={(e) => handleFieldChange('sugestaoVideoLibras', e.target.value)}
                    className="w-full h-48 p-3 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green bg-white transition"
                    aria-label="Roteiro para LIBRAS Editável"
                  />
                  <div className="absolute top-2 right-2">
                    <CopyButton textToCopy={editableResult.sugestaoVideoLibras}/>
                  </div>
                </div>
              </details>
            </ResultSection>

            <ResultSection title={
              <>
                <EyeOffIcon className="h-6 w-6" />
                Sugestão de Audiodescrição
              </>
            }>
              <div className="space-y-4">
                  <div>
                      <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-bold text-gray-600">Para a Atividade:</label>
                           <div className="flex items-center space-x-2">
                               <SpeechButton textToSpeak={editableResult.sugestaoAudiodescricao.atividade} />
                               <CopyButton textToCopy={editableResult.sugestaoAudiodescricao.atividade} />
                           </div>
                      </div>
                      <textarea
                          value={editableResult.sugestaoAudiodescricao.atividade}
                          onChange={(e) => handleNestedFieldChange('sugestaoAudiodescricao', 'atividade', e.target.value)}
                          className="w-full h-32 p-3 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green bg-white transition"
                          aria-label="Audiodescrição da Atividade Editável"
                      />
                  </div>
                  <div>
                      <div className="flex justify-between items-center mb-2">
                           <label className="text-sm font-bold text-gray-600">Para a Imagem:</label>
                           <div className="flex items-center space-x-2">
                               <SpeechButton textToSpeak={editableResult.sugestaoAudiodescricao.imagem} />
                               <CopyButton textToCopy={editableResult.sugestaoAudiodescricao.imagem} />
                           </div>
                      </div>
                      <textarea
                          value={editableResult.sugestaoAudiodescricao.imagem}
                          onChange={(e) => handleNestedFieldChange('sugestaoAudiodescricao', 'imagem', e.target.value)}
                          className="w-full h-32 p-3 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green bg-white transition"
                          aria-label="Audiodescrição da Imagem Editável"
                      />
                  </div>
              </div>
            </ResultSection>
        </div>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={editableResult.id ? `${window.location.origin}?id=${editableResult.id}` : window.location.origin}
        title={editableResult.conteudoTema}
      />
    </div>
  );
};
