import React, { useEffect, useState } from 'react';
import { ConsolidatedCard } from '../types';

interface CardPreviewModalProps {
  card: ConsolidatedCard | null;
  isOpen: boolean;
  onClose: () => void;
}

const CardPreviewModal: React.FC<CardPreviewModalProps> = ({ card, isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentCard, setCurrentCard] = useState<ConsolidatedCard | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen && card) {
      // Store the current card and start rendering
      setCurrentCard(card);
      setShouldRender(true);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Force a reflow, then start animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else if (!isOpen && shouldRender) {
      // Start closing animation (keep currentCard for fade-out)
      setIsVisible(false);
      
      // Clean up after animation
      const cleanup = setTimeout(() => {
        setShouldRender(false);
        setCurrentCard(null);
        document.body.style.overflow = 'unset';
      }, 300);

      return () => {
        clearTimeout(cleanup);
        document.removeEventListener('keydown', handleEscape);
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, card, shouldRender]);

  if (!shouldRender || !currentCard) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Dimmed background overlay */}
      <div 
        className={`absolute inset-0 bg-black transition-all duration-300 ease-out ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Card image only */}
      <img
        src={currentCard.baseCard.images.full}
        alt={currentCard.baseCard.fullName}
        className={`relative max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl transition-all duration-300 ease-out transform ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
        onClick={onClose}
      />
    </div>
  );
};

export default CardPreviewModal;