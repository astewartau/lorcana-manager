import React, { useState, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import { ConsolidatedCard } from '../../types';

interface DeckBuilderCardProps {
  consolidatedCard: ConsolidatedCard;
  deckQuantity: number;
  collectionQuantity: number;
  onAddCard: (card: ConsolidatedCard) => void;
  onRemoveCard: (cardId: number) => void;
  canAdd: boolean;
}

const DeckBuilderCard: React.FC<DeckBuilderCardProps> = ({ 
  consolidatedCard, 
  deckQuantity,
  collectionQuantity,
  onAddCard,
  onRemoveCard,
  canAdd
}) => {
  const { baseCard } = consolidatedCard;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [transform, setTransform] = useState('');
  const [lightPosition, setLightPosition] = useState({ x: 50, y: 50 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation based on mouse position
    const rotateX = ((y - centerY) / centerY) * -15; // Max 15 degrees
    const rotateY = ((x - centerX) / centerX) * 15; // Max 15 degrees
    
    // Calculate light position as percentage
    const lightX = (x / rect.width) * 100;
    const lightY = (y / rect.height) * 100;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setLightPosition({ x: lightX, y: lightY });
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('');
    setLightPosition({ x: 50, y: 50 });
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Card Image with tilt effect */}
      <div 
        ref={cardRef}
        className="relative rounded-sm shadow-md hover:shadow-2xl transition-all duration-300 ease-out aspect-[2.5/3.5] overflow-hidden cursor-pointer transform-gpu select-none border-2 border-lorcana-gold"
        style={{
          transform: transform,
          transformOrigin: 'center center',
          transition: isHovered ? 'transform 0.1s ease-out, box-shadow 0.3s ease-out' : 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease-out'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img 
          src={baseCard.images.full} 
          alt={baseCard.fullName}
          className="w-full h-full object-cover"
          loading="lazy"
          style={{ pointerEvents: 'none' }}
        />
        
        {/* Light overlay effect */}
        {isHovered && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${lightPosition.x}% ${lightPosition.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 30%, transparent 60%)`
            }}
          />
        )}
        

        {/* Max copies indicator */}
        {deckQuantity >= 4 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-2 py-1 rounded-sm text-xs font-bold border border-white">
              MAX
            </span>
          </div>
        )}
      </div>

      {/* Deck Controls - Below Card */}
      <div className="flex items-center justify-between px-2 py-1 bg-lorcana-cream rounded-sm border-2 border-lorcana-gold">
        <button
          onClick={() => onRemoveCard(baseCard.id)}
          disabled={deckQuantity <= 0}
          className="w-6 h-6 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors rounded-sm"
        >
          <Minus size={12} />
        </button>
        
        <span className="text-sm font-semibold text-lorcana-ink">
          {deckQuantity}{collectionQuantity > 0 ? `/${Math.min(collectionQuantity, 4)}` : ''}
        </span>
        
        <button
          onClick={() => onAddCard(consolidatedCard)}
          disabled={!canAdd}
          className="w-6 h-6 flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors rounded-sm"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
};

export default DeckBuilderCard;