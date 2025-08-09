import { useState, useEffect, useRef, useMemo } from 'react';

interface UseDynamicGridOptions {
  minCardWidth?: number;
  gapSize?: number;
  maxColumns?: number;
}

export const useDynamicGrid = ({
  minCardWidth = 180,
  gapSize = 16,
  maxColumns = 8
}: UseDynamicGridOptions = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Calculate number of columns based on available width
  const columns = useMemo(() => {
    if (containerWidth === 0) return 2; // Default fallback

    // Account for gaps: if we have n columns, we have (n-1) gaps
    // So: availableWidth = n * cardWidth + (n-1) * gapSize
    // Solving for n: n = (availableWidth + gapSize) / (cardWidth + gapSize)
    const calculatedColumns = Math.floor((containerWidth + gapSize) / (minCardWidth + gapSize));

    // Ensure we always have at least 1 column and respect maximum
    return Math.max(1, Math.min(calculatedColumns, maxColumns));
  }, [containerWidth, minCardWidth, gapSize, maxColumns]);

  // Set up ResizeObserver to track container width changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setContainerWidth(container.clientWidth);
    };

    // Initial measurement
    updateWidth();

    // Set up ResizeObserver for future changes
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(container);

    // Also listen to window resize as backup
    window.addEventListener('resize', updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Return the ref, calculated columns, and grid styles
  return {
    containerRef,
    columns,
    gridStyle: {
      display: 'grid' as const,
      gridTemplateColumns: `repeat(${columns}, minmax(${minCardWidth}px, 1fr))`,
      gap: `${gapSize}px`
    }
  };
};