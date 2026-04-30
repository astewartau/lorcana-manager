import { useState, useRef, useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  totalItems: number;
  initialBatchSize?: number;
  batchSize?: number;
  threshold?: number;
}

export function useInfiniteScroll({
  totalItems,
  initialBatchSize = 24,
  batchSize = 12,
  threshold = 300,
}: UseInfiniteScrollOptions) {
  const [visibleCount, setVisibleCount] = useState(initialBatchSize);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = visibleCount < totalItems;

  const reset = useCallback(() => {
    setVisibleCount(initialBatchSize);
  }, [initialBatchSize]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + batchSize, totalItems));
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, batchSize, totalItems, threshold]);

  return { visibleCount, sentinelRef, hasMore, reset };
}
