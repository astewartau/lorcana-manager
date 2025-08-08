import React, { useState, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import { ConsolidatedCard } from '../types';

interface ConsolidatedCardProps {
  consolidatedCard: ConsolidatedCard;
  quantities: { regular: number; foil: number; enchanted: number; special: number };
  onQuantityChange: (variantType: 'regular' | 'foil' | 'enchanted' | 'special', change: number) => void;
  onCardClick?: (card: ConsolidatedCard) => void;
}

const ConsolidatedCardComponent: React.FC<ConsolidatedCardProps> = ({ 
  consolidatedCard, 
  quantities,
  onQuantityChange,
  onCardClick
}) => {
  const { baseCard, hasEnchanted, hasSpecial, enchantedCard } = consolidatedCard;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [transform, setTransform] = useState('');
  const [lightPosition, setLightPosition] = useState({ x: 50, y: 50 });
  const [showEnchanted, setShowEnchanted] = useState(false);
  
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
    if (hasEnchanted) {
      setShowEnchanted(true);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('');
    setLightPosition({ x: 50, y: 50 });
    setShowEnchanted(false);
  };

  const getVariantBackground = (variantType: 'regular' | 'foil' | 'enchanted' | 'special') => {
    switch (variantType) {
      case 'regular':
        return 'bg-gray-100 border-gray-200';
      case 'foil':
        return 'bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 border-blue-300';
      case 'enchanted':
        return 'bg-gradient-to-r from-red-200 via-yellow-200 via-green-200 via-blue-200 to-purple-200 border-purple-300';
      case 'special':
        return 'bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-300 border-orange-300';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const renderQuantityControl = (
    variantType: 'regular' | 'foil' | 'enchanted' | 'special',
    quantity: number,
    isAvailable: boolean
  ) => {
    if (!isAvailable) return null;

    return (
      <div className={`flex items-center justify-between px-2 py-1 rounded-md border ${getVariantBackground(variantType)} transition-all`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuantityChange(variantType, -1);
          }}
          disabled={quantity <= 0}
          className="p-0.5 rounded text-red-600 hover:text-red-800 transition-colors disabled:text-gray-400"
        >
          <Minus size={10} />
        </button>
        <span className="font-semibold text-xs min-w-[1rem] text-center text-gray-800">
          {quantity}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuantityChange(variantType, 1);
          }}
          className="p-0.5 rounded text-green-600 hover:text-green-800 transition-colors"
        >
          <Plus size={10} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Card Image */}
      <div 
        ref={cardRef}
        className="relative rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 ease-out aspect-[2.5/3.5] overflow-hidden cursor-pointer transform-gpu select-none"
        style={{
          transform: transform,
          transformOrigin: 'center center',
          transition: isHovered ? 'transform 0.1s ease-out, box-shadow 0.3s ease-out' : 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease-out'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onCardClick?.(consolidatedCard)}
      >
        {/* Base card image */}
        <img 
          src={baseCard.images.full} 
          alt={baseCard.fullName}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          style={{ 
            pointerEvents: 'none',
            opacity: hasEnchanted && showEnchanted ? 0 : 1,
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
        
        {/* Enchanted card image (only rendered if available) */}
        {hasEnchanted && enchantedCard && (
          <img 
            src={enchantedCard.images.full} 
            alt={enchantedCard.fullName}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            style={{ 
              pointerEvents: 'none',
              opacity: showEnchanted ? 1 : 0,
              transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: showEnchanted ? 'scale(1)' : 'scale(1.05)',
              filter: showEnchanted ? 'none' : 'brightness(1.2) saturate(1.3)'
            }}
          />
        )}
        
        {/* Light overlay effect */}
        {isHovered && (
          <>
            <div 
              className="absolute inset-0 pointer-events-none opacity-30 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${lightPosition.x}% ${lightPosition.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 30%, transparent 60%)`
              }}
            />
            {/* Enchanted shimmer effect */}
            {hasEnchanted && showEnchanted && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(105deg, 
                    transparent 40%, 
                    rgba(255, 255, 255, 0.7) 45%, 
                    rgba(255, 255, 255, 0.9) 50%, 
                    rgba(255, 255, 255, 0.7) 55%, 
                    transparent 60%)`,
                  transform: 'translateX(-100%)',
                  animation: 'shimmer 1.5s ease-out'
                }}
              />
            )}
          </>
        )}
        
        {/* Variant indicators */}
        <div className="absolute top-2 right-2 flex flex-col space-y-1">
          {hasEnchanted && (
            <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              E
            </div>
          )}
          {hasSpecial && (
            <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              S
            </div>
          )}
        </div>
      </div>

      {/* Quantity controls below card - all in one centered row */}
      <div className="flex justify-center space-x-1">
        {renderQuantityControl('regular', quantities.regular, consolidatedCard.hasRegular)}
        {renderQuantityControl('foil', quantities.foil, consolidatedCard.hasFoil)}
        {hasEnchanted && renderQuantityControl('enchanted', quantities.enchanted, true)}
        {hasSpecial && renderQuantityControl('special', quantities.special, true)}
      </div>
    </div>
  );
};

export default ConsolidatedCardComponent;