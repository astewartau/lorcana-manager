import React, { useEffect, useState, useRef } from 'react';
import { ConsolidatedCard } from '../types';
import { Sparkles } from 'lucide-react';

interface CardPreviewModalProps {
  card: ConsolidatedCard | null;
  isOpen: boolean;
  onClose: () => void;
}

const CardPreviewModal: React.FC<CardPreviewModalProps> = ({ card, isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentCard, setCurrentCard] = useState<ConsolidatedCard | null>(null);
  const [showEnchanted, setShowEnchanted] = useState(false);
  
  // 3D tilt effect state
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [lightPosition, setLightPosition] = useState({ x: 50, y: 50 });

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
      setShowEnchanted(false); // Reset to normal version when opening
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
        setShowEnchanted(false);
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

  // 3D tilt effect handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation based on mouse position (reduced intensity for larger modal)
    const rotateX = ((y - centerY) / centerY) * -8; // Max 8 degrees (reduced from 15)
    const rotateY = ((x - centerX) / centerX) * 8; // Max 8 degrees (reduced from 15)
    
    // Calculate light position as percentage
    const lightX = (x / rect.width) * 100;
    const lightY = (y / rect.height) * 100;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setLightPosition({ x: lightX, y: lightY });
  };
  
  const handleMouseLeave = () => {
    setTransform('');
    setLightPosition({ x: 50, y: 50 });
  };

  if (!shouldRender || !currentCard) return null;

  const hasEnchanted = currentCard.hasEnchanted && currentCard.enchantedCard;

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
      
      {/* Card container with version switcher */}
      <div className="relative flex flex-col items-center gap-4">
        {/* Card images with 3D tilt effect */}
        <div 
          ref={cardRef}
          className="relative cursor-pointer transform-gpu select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: transform,
            transition: transform ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        >
          {/* Holographic light effect overlay */}
          <div 
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${lightPosition.x}% ${lightPosition.y}%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`,
              opacity: transform ? 0.8 : 0,
              transition: 'opacity 0.3s ease-out'
            }}
          />
          
          {/* Base card image */}
          <img
            src={currentCard.baseCard.images.full}
            alt={currentCard.baseCard.fullName}
            className={`max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl transition-all duration-500 ease-out ${
              isVisible && !showEnchanted ? 'opacity-100 scale-100' : isVisible ? 'opacity-0 scale-95' : 'opacity-0 scale-75'
            }`}
            onClick={onClose}
            draggable={false}
          />
          
          {/* Enchanted card image */}
          {hasEnchanted && (
            <img
              src={currentCard.enchantedCard!.images.full}
              alt={`${currentCard.enchantedCard!.fullName} (Enchanted)`}
              className={`max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl transition-all duration-500 ease-out ${
                isVisible && showEnchanted ? 'opacity-100 scale-100' : isVisible ? 'opacity-0 scale-105' : 'opacity-0 scale-75'
              }`}
              onClick={onClose}
              draggable={false}
              style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: `translateX(-50%) ${isVisible && showEnchanted ? 'scale(1)' : isVisible ? 'scale(1.05)' : 'scale(0.75)'}`
              }}
            />
          )}
        </div>
        
        {/* Version switcher buttons */}
        {hasEnchanted && (
          <div className={`flex gap-2 transition-all duration-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEnchanted(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                !showEnchanted
                  ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Normal
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEnchanted(true);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                showEnchanted
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Sparkles size={16} />
              Enchanted
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardPreviewModal;