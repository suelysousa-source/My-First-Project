import React, { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const TwitterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareUrl, title }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Confira esta atividade pedagógica adaptada: ${title}`;
  
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-4 border-brand-text rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] w-full max-w-md overflow-hidden animate-slide-up">
        <div className="bg-brand-primary p-4 border-b-4 border-brand-text flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brand-text">Compartilhar Atividade</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-pink-300 rounded-full transition-colors border-2 border-transparent hover:border-brand-text"
          >
            <XIcon />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Link da Atividade</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={shareUrl}
                className="flex-grow px-3 py-2 border-2 border-brand-text rounded-lg bg-gray-50 font-mono text-sm overflow-hidden text-ellipsis"
              />
              <button 
                onClick={handleCopy}
                className={`p-2 border-2 border-brand-text rounded-lg shadow-[2px_2px_0px_#212121] active:shadow-none active:translate-y-px transition-all ${
                  copied ? 'bg-green-500 text-white' : 'bg-white hover:bg-brand-highlight'
                }`}
                title="Copiar link"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Redes Sociais</label>
            <div className="grid grid-cols-2 gap-4">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white border-2 border-brand-text rounded-lg font-bold shadow-[4px_4px_0px_#212121] hover:shadow-[2px_2px_0px_#212121] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
              <a 
                href={twitterUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-black text-white border-2 border-brand-text rounded-lg font-bold shadow-[4px_4px_0px_#212121] hover:shadow-[2px_2px_0px_#212121] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
              >
                <TwitterIcon />
                Twitter / X
              </a>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t-2 border-brand-text text-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 border-2 border-brand-text rounded-lg font-bold hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
