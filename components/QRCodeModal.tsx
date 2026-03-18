import React from 'react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url }) => {
  if (!isOpen) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-brand-surface border-4 border-brand-text rounded-2xl p-6 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-brand-text">Acesse o App</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-brand-primary rounded-full transition-colors border-2 border-transparent hover:border-brand-text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white border-4 border-brand-text rounded-xl">
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="w-[200px] h-[200px]"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <p className="text-center text-brand-text font-medium">
            Aponte a câmera do seu celular para o QR Code para acessar o aplicativo.
          </p>
          
          <div className="w-full p-3 bg-brand-bg border-2 border-brand-text rounded-lg break-all text-xs font-mono">
            {url}
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-2 bg-brand-green text-brand-text font-bold rounded-lg border-2 border-brand-text shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
