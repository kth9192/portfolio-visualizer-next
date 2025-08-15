// hooks/useHorizontalScroll.ts
import { useRef, useState, useEffect } from 'react';

export const useHorizontalScroll = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState({ startX: 0, scrollLeft: 0 });

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - dragState.startX) * 2;
      container.scrollLeft = dragState.scrollLeft - walk;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousemove', handleMouseMove, { passive: false });
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDragging, dragState]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scrollContainerRef.current) {
      setIsDragging(true);
      setDragState({
        startX: e.pageX - scrollContainerRef.current.offsetLeft,
        scrollLeft: scrollContainerRef.current.scrollLeft
      });
    }
  };

  const scrollTo = (direction: 'left' | 'right', amount = 320) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -amount : amount;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return {
    scrollContainerRef,
    canScrollLeft,
    canScrollRight,
    isDragging,
    handleMouseDown,
    checkScrollability,
    scrollTo
  };
};