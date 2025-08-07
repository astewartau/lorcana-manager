import React, { useState, useRef } from 'react';
import { Edit3, Copy, Trash2, Download } from 'lucide-react';
import { Deck } from '../types';
import { COLOR_ICONS } from '../constants/icons';

interface DeckBox3DProps {
  deck: Deck;
  summary: {
    cardCount: number;
    inkDistribution: Record<string, number>;
    isValid: boolean;
    updatedAt: Date;
  };
  onEdit: (deckId: string) => void;
  onDuplicate: (deckId: string) => void;
  onDelete: (deckId: string) => void;
  onExport: (deckId: string) => void;
}

const DeckBox3D: React.FC<DeckBox3DProps> = ({
  deck,
  summary,
  onEdit,
  onDuplicate,
  onDelete,
  onExport
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!boxRef.current) return;
    
    const box = boxRef.current;
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation based on mouse position (stronger for real 3D effect)
    const newRotateX = ((y - centerY) / centerY) * -25; // Max 25 degrees
    const newRotateY = ((x - centerX) / centerX) * 25; // Max 25 degrees
    
    setRotateX(newRotateX);
    setRotateY(newRotateY);
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const getInkColorBg = (color: string) => {
    switch (color) {
      case 'Amber': return 'bg-yellow-400';
      case 'Amethyst': return 'bg-purple-400';
      case 'Emerald': return 'bg-green-400';
      case 'Ruby': return 'bg-red-400';
      case 'Sapphire': return 'bg-blue-400';
      case 'Steel': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const inkColors = Object.entries(summary.inkDistribution)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  // Filter out dual-ink combinations to get only the actual base ink colors
  const baseInkColors = inkColors.filter(([color]) => !color.includes('-'));

  // Get primary ink color for deckbox styling (use base colors only)
  const primaryInkColor = baseInkColors[0]?.[0] || inkColors[0]?.[0] || 'Steel';
  
  const getDeckboxGradient = (color: string) => {
    switch (color) {
      case 'Amber': return 'from-yellow-500 via-yellow-400 to-yellow-600';
      case 'Amethyst': return 'from-purple-500 via-purple-400 to-purple-600';
      case 'Emerald': return 'from-green-500 via-green-400 to-green-600';
      case 'Ruby': return 'from-red-500 via-red-400 to-red-600';
      case 'Sapphire': return 'from-blue-500 via-blue-400 to-blue-600';
      case 'Steel': return 'from-gray-500 via-gray-400 to-gray-600';
      default: return 'from-gray-500 via-gray-400 to-gray-600';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 3D Scene Container */}
      <div 
        className="w-48 h-64 flex items-center justify-center"
        style={{ perspective: '1000px' }}
      >
        <div
          ref={boxRef}
          className="relative cursor-pointer transform-gpu select-none"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovered ? 'scale3d(1.05, 1.05, 1.05)' : 'scale3d(1, 1, 1)'}`,
            transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => onEdit(deck.id)}
        >
          {/* Real 3D Deckbox with 6 faces */}
          <div className="relative w-24 h-36" style={{ transformStyle: 'preserve-3d' }}>
            
            {/* Front Face */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br ${getDeckboxGradient(primaryInkColor)} border-2 border-gray-700 flex flex-col justify-between p-3 shadow-xl`}
              style={{ transform: 'translateZ(30px)' }}
            >
              {/* Deck Name */}
              <div className="text-white font-bold text-xs text-center leading-tight drop-shadow-lg">
                {deck.name}
              </div>
              
              {/* Spacer */}
              <div className="flex-1" />
              
              {/* Large Ink Color Icons - Base colors only */}
              {baseInkColors.length > 0 && (
                <div className="flex justify-center items-center space-x-1">
                  {baseInkColors.map(([color]) => (
                    <div 
                      key={color} 
                      className="relative w-8 h-8 flex items-center justify-center"
                      title={color}
                    >
                      {COLOR_ICONS[color] ? (
                        <img 
                          src={COLOR_ICONS[color]} 
                          alt={color}
                          className="w-full h-full drop-shadow-lg"
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                        />
                      ) : (
                        <div className={`w-6 h-6 rounded-full ${getInkColorBg(color)} border-2 border-white/80 shadow-lg`} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Back Face */}
            <div 
              className={`absolute inset-0 bg-gradient-to-bl ${getDeckboxGradient(primaryInkColor)} border-2 border-gray-800 flex items-center justify-center shadow-xl`}
              style={{ 
                transform: 'translateZ(-30px) rotateY(180deg)',
                filter: 'brightness(0.8)'
              }}
            >
              <div className="text-white/60 text-xs text-center">
                <div className="font-bold tracking-wide">DECK BOX</div>
                <div className="text-xs mt-1">{baseInkColors.length} Color{baseInkColors.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            
            {/* Top Face */}
            <div 
              className={`absolute w-full bg-gradient-to-b ${getDeckboxGradient(primaryInkColor)} border-2 border-gray-700 flex items-center justify-center shadow-lg`}
              style={{ 
                height: '60px',
                transform: 'rotateX(90deg) translateZ(18px)',
                top: '-10px',
                filter: 'brightness(1.3)',
                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)'
              }}
            >
              <div className="text-white/90 text-[10px] font-bold text-center drop-shadow">
                {deck.name.slice(0, 8)}{deck.name.length > 8 ? '...' : ''}
              </div>
            </div>
            
            {/* Bottom Face */}
            <div 
              className={`absolute w-full bg-gradient-to-t ${getDeckboxGradient(primaryInkColor)} border-2 border-gray-800 shadow-inner`}
              style={{ 
                height: '60px',
                transform: 'rotateX(-90deg) translateZ(18px)',
                bottom: '-8px',
                filter: 'brightness(0.5)'
              }}
            />
            
            {/* Left Face */}
            <div 
              className={`absolute h-full bg-gradient-to-r ${getDeckboxGradient(primaryInkColor)} border-2 border-gray-800 shadow-lg`}
              style={{ 
                width: '60px',
                transform: 'rotateY(-90deg) translateZ(30px)',
                left: '0px',
                filter: 'brightness(0.7)'
              }}
            />
            
            {/* Right Face */}
            <div 
              className={`absolute h-full bg-gradient-to-l ${getDeckboxGradient(primaryInkColor)} border-2 border-gray-600 shadow-lg`}
              style={{ 
                width: '60px',
                transform: 'rotateY(90deg) translateZ(30px)',
                right: '0px',
                filter: 'brightness(0.85)'
              }}
            />
            
            {/* Ambient occlusion shadows */}
            <div 
              className="absolute inset-0 pointer-events-none shadow-inner"
              style={{ 
                transform: 'translateZ(31px)',
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.1) 100%)'
              }}
            />
          </div>
          
          {/* Dynamic ground shadow */}
          <div 
            className="absolute bg-black/20 rounded-full blur-md"
            style={{
              width: `${40 + Math.abs(rotateY) * 0.5}px`,
              height: `${20 + Math.abs(rotateX) * 0.3}px`,
              bottom: '-35px',
              left: '50%',
              transform: `translateX(-50%) translateX(${rotateY * 0.5}px) scale(${1 + (Math.abs(rotateX) + Math.abs(rotateY)) * 0.005})`,
              opacity: 0.3 + (Math.abs(rotateX) + Math.abs(rotateY)) * 0.005
            }}
          />
        </div>
      </div>
      
      {/* Deck Name */}
      <div className="text-center max-w-48">
        <h3 className="text-sm font-bold text-gray-900 truncate">{deck.name}</h3>
        {deck.description && (
          <p className="text-xs text-gray-600 truncate mt-1">{deck.description}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">{formatDate(summary.updatedAt)}</p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(deck.id);
          }}
          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
          title="Edit deck"
        >
          <Edit3 size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(deck.id);
          }}
          className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
          title="Duplicate deck"
        >
          <Copy size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExport(deck.id);
          }}
          className="p-1.5 text-purple-600 hover:bg-purple-100 rounded transition-colors"
          title="Export deck"
        >
          <Download size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(deck.id);
          }}
          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
          title="Delete deck"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default DeckBox3D;