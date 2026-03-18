import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState<string>('sugestao');
  const [comments, setComments] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Feedback do Assistente Pedagógico - ${feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)}`;
    const body = `
      Avaliação: ${rating ? `${rating}/5 estrelas` : 'Não avaliado'}
      Tipo de Feedback: ${feedbackType}
      -------------------------------------
      Comentários:
      ${comments}
    `;

    // Using mailto: as a simple submission mechanism
    window.location.href = `mailto:suelysousa18@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
    
    setIsSubmitted(true);
    // Reset form after a delay
    setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setRating(null);
        setFeedbackType('sugestao');
        setComments('');
    }, 3000);
  };
  
  const handleRating = (rate: number) => {
      setRating(rate === rating ? null : rate); // Allow deselecting
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-brand-surface border-4 border-brand-text rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 md:p-8 w-full max-w-lg relative">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Fechar formulário"
        >
          {/* X Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {isSubmitted ? (
            <div className="text-center py-8">
                <h2 className="text-2xl font-bold text-brand-green mb-3">Obrigado!</h2>
                <p className="text-gray-600">Seu feedback é muito importante para nós. Seu aplicativo de e-mail deve abrir em breve.</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold text-brand-text mb-4">Formulário de Satisfação</h2>
                <p className="text-gray-600 mb-6">Sua opinião nos ajuda a melhorar esta ferramenta.</p>
                
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Como você avalia o aplicativo? (Termômetro de Uso)</label>
                  <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} type="button" onClick={() => handleRating(star)} className="focus:outline-none transform hover:scale-110 transition-transform">
                            <svg className={`w-8 h-8 transition-colors ${rating && rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                      ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="feedbackType" className="block text-sm font-bold text-gray-700 mb-1">Tipo de Feedback</label>
                  <select
                    id="feedbackType"
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green bg-white transition"
                  >
                    <option value="sugestao">Sugestão de Melhoria</option>
                    <option value="erro">Relatório de Erro</option>
                    <option value="elogio">Elogio</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="comments" className="block text-sm font-bold text-gray-700 mb-1">
                    Comentários
                  </label>
                  <textarea
                    id="comments"
                    rows={4}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Descreva sua sugestão ou o erro encontrado aqui..."
                    className="w-full px-3 py-2 border-2 border-brand-text rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green bg-white transition"
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center px-6 py-2 border-2 border-brand-text text-base font-bold rounded-lg shadow-[4px_4px_0px_#212121] hover:shadow-[2px_2px_0px_#212121] active:shadow-none text-brand-text bg-brand-primary hover:bg-pink-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transform hover:-translate-y-px active:translate-y-px transition-all"
                    >
                        Enviar Feedback
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};