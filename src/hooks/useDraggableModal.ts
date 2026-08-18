import { useState, useRef, useEffect, useCallback } from "react";

export function useDraggableModal() {
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const startPosRef = useRef<{
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  }>({ startX: 0, startY: 0, offsetX: 0, offsetY: 0 });

  // 터치 이벤트 핸들러 (모바일)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPosRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startPosRef.current.startX;
    const dy = touch.clientY - startPosRef.current.startY;
    setOffset({
      x: startPosRef.current.offsetX + dx,
      y: startPosRef.current.offsetY + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 마우스 이벤트 핸들러 (PC)
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "BUTTON" ||
      target.tagName === "TEXTAREA" ||
      target.closest("button")
    ) {
      return;
    }

    startPosRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startPosRef.current.startX;
      const dy = e.clientY - startPosRef.current.startY;
      setOffset({
        x: startPosRef.current.offsetX + dx,
        y: startPosRef.current.offsetY + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleResetPosition = () => {
    setOffset({ x: 0, y: 0 });
  };

  return {
    offset,
    isDragging,
    dragHandleProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      style: { touchAction: "none" as const, cursor: isDragging ? "grabbing" : "grab" },
    },
    modalStyle: {
      transform: `translate(${offset.x}px, ${offset.y}px)`,
      transition: isDragging ? "none" : "transform 0.15s ease-out",
    },
    handleResetPosition,
  };
}
