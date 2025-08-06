import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { ConsolidatedCard } from '../types';

interface ConsolidatedCardProps {
  consolidatedCard: ConsolidatedCard;
  quantities: { regular: number; foil: number; enchanted: number; special: number };
  onQuantityChange: (variantType: 'regular' | 'foil' | 'enchanted' | 'special', change: number) => void;
}

const ConsolidatedCardComponent: React.FC<ConsolidatedCardProps> = ({ 
  consolidatedCard, 
  quantities,
  onQuantityChange 
}) => {
  const { baseCard, variants, hasEnchanted, hasSpecial } = consolidatedCard;

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
          onClick={() => onQuantityChange(variantType, -1)}
          disabled={quantity <= 0}
          className="p-0.5 rounded text-red-600 hover:text-red-800 transition-colors disabled:text-gray-400"
        >
          <Minus size={10} />
        </button>
        <span className="font-semibold text-xs min-w-[1rem] text-center text-gray-800">
          {quantity}
        </span>
        <button
          onClick={() => onQuantityChange(variantType, 1)}
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
      <div className="relative rounded-lg shadow-md hover:shadow-lg transition-shadow aspect-[2.5/3.5] overflow-hidden">
        <img 
          src={baseCard.images.full} 
          alt={baseCard.fullName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
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
        {renderQuantityControl('regular', quantities.regular, variants.regular !== null)}
        {renderQuantityControl('foil', quantities.foil, variants.foil !== null)}
        {hasEnchanted && renderQuantityControl('enchanted', quantities.enchanted, true)}
        {hasSpecial && renderQuantityControl('special', quantities.special, true)}
      </div>
    </div>
  );
};

export default ConsolidatedCardComponent;