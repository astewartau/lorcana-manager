import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { LorcanaCard } from '../types';

interface CardBackProps {
  card: LorcanaCard;
  quantity?: number;
  showQuantityControls?: boolean;
  onQuantityChange?: (cardId: number, change: number) => void;
}

const CardBack: React.FC<CardBackProps> = ({ 
  card, 
  quantity = 0, 
  showQuantityControls = false, 
  onQuantityChange 
}) => {
  return (
    <div className="relative rounded-lg shadow-md hover:shadow-lg transition-shadow aspect-[2.5/3.5] overflow-hidden">
      <img 
        src={card.images.thumbnail} 
        alt={card.fullName}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {showQuantityControls && (
        <div className="absolute -bottom-2 -right-2 bg-white rounded-full shadow-lg p-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onQuantityChange?.(card.id, -1)}
              className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              disabled={quantity <= 0}
            >
              <Minus size={12} />
            </button>
            <span className="font-semibold text-sm min-w-[1.5rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => onQuantityChange?.(card.id, 1)}
              className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardBack;