import React from 'react';

interface PieChartProps {
  data: Record<string, number>;
  title: string;
  colors: string[];
  size?: number;
  showLegend?: boolean;
  onClick?: () => void;
  onTooltipShow?: (x: number, y: number, content: string) => void;
  onTooltipHide?: () => void;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  colors,
  size = 50,
  showLegend = false,
  onClick,
  onTooltipShow,
  onTooltipHide
}) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  if (total === 0) return null;

  const dataEntries = Object.entries(data).filter(([, value]) => value > 0);
  const radius = size * 0.4;
  const center = size / 2;

  // Special case: if only one category, show as full circle
  if (dataEntries.length === 1) {
    const [key, value] = dataEntries[0];
    const color = colors[0];

    return (
      <div className="flex flex-col items-center">
        <div className="text-xs font-medium text-lorcana-navy mb-1">{title}</div>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={onClick ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-pointer'}
          onClick={onClick}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill={color}
            stroke="white"
            strokeWidth="1"
            className="hover:opacity-80 transition-opacity"
            onMouseEnter={(e) => {
              if (onTooltipShow) {
                const rect = e.currentTarget.getBoundingClientRect();
                onTooltipShow(
                  rect.left + rect.width / 2,
                  rect.top - 10,
                  `${key}: ${value} cards (100.0%)`
                );
              }
            }}
            onMouseLeave={() => onTooltipHide?.()}
          />
        </svg>
        {showLegend && (
          <Legend entries={[{ key, value, percentage: '100.0', color }]} total={total} />
        )}
      </div>
    );
  }

  let cumulativePercentage = 0;
  const segments = dataEntries.map(([key, value], index) => {
    const percentage = (value / total) * 100;
    const startAngle = cumulativePercentage * 3.6;
    const endAngle = (cumulativePercentage + percentage) * 3.6;

    cumulativePercentage += percentage;

    const color = colors[index % colors.length];

    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);

    const largeArc = percentage > 50 ? 1 : 0;

    const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      key,
      value,
      percentage: percentage.toFixed(1),
      pathData,
      color
    };
  });

  const handleMouseEnter = (e: React.MouseEvent, segment: typeof segments[0]) => {
    if (onTooltipShow) {
      const rect = e.currentTarget.getBoundingClientRect();
      onTooltipShow(
        rect.left + rect.width / 2,
        rect.top - 10,
        `${segment.key}: ${segment.value} cards (${segment.percentage}%)`
      );
    }
  };

  const handleMouseLeave = () => {
    onTooltipHide?.();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-medium text-lorcana-navy mb-1">{title}</div>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={onClick ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-pointer'}
        onClick={onClick}
      >
        {segments.map(segment => (
          <path
            key={segment.key}
            d={segment.pathData}
            fill={segment.color}
            stroke="white"
            strokeWidth="1"
            className="hover:opacity-80 transition-opacity"
            onMouseEnter={(e) => handleMouseEnter(e, segment)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </svg>
      {showLegend && (
        <Legend entries={segments} total={total} />
      )}
    </div>
  );
};

/** Legend displayed below pie chart in detail view */
const Legend: React.FC<{ entries: { key: string; value: number; percentage: string; color: string }[]; total: number }> = ({ entries, total }) => (
  <div className="w-full mt-3 space-y-1">
    {entries.map(entry => (
      <div key={entry.key} className="flex items-center gap-2 text-xs">
        <div
          className="w-3 h-3 rounded-sm flex-shrink-0"
          style={{ backgroundColor: entry.color }}
        />
        <span className="flex-1 text-lorcana-ink truncate">{entry.key}</span>
        <span className="text-lorcana-navy font-medium">{entry.value}</span>
        <span className="text-lorcana-navy/50 w-12 text-right">{entry.percentage}%</span>
      </div>
    ))}
    <div className="flex items-center gap-2 text-xs border-t border-lorcana-gold/30 pt-1 mt-1">
      <div className="w-3 h-3 flex-shrink-0" />
      <span className="flex-1 text-lorcana-ink font-medium">Total</span>
      <span className="text-lorcana-navy font-bold">{total}</span>
      <span className="w-12" />
    </div>
  </div>
);

export default PieChart;
