import React, { useState } from 'react';
import { QRCodeModal } from './QRCodeModal';

const BookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);

const QrCodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
    <line x1="7" y1="7" x2="7" y2="7"></line>
    <line x1="17" y1="7" x2="17" y2="7"></line>
    <line x1="17" y1="17" x2="17" y2="17"></line>
    <line x1="7" y1="17" x2="7" y2="17"></line>
  </svg>
);

export const Header: React.FC = () => {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const sharedUrl = "https://ais-pre-ob2vhntzgx5heegjpnpr56-141016116699.us-west1.run.app";

  return (
    <header className="bg-brand-primary text-brand-text border-b-4 border-brand-text shadow-lg">
      <div className="container mx-auto px-4 py-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center">
            <BookIcon className="h-8 w-8 text-brand-text mr-3"/>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-text">
              Assistente Pedagógico
            </h1>
        </div>
        
        <button 
          onClick={() => setIsQRModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-brand-surface border-2 border-brand-text rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-brand-highlight active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all font-bold text-sm sm:text-base"
          title="Ver QR Code do App"
        >
          <QrCodeIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Acessar no Celular</span>
        </button>
      </div>

      <QRCodeModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)} 
        url={sharedUrl} 
      />
    </header>
  );
};
