// src/hooks/useSearchFocus.ts
import { useRef, useCallback, useEffect } from 'react';

export const useSearchFocus = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const wasFocused = useRef<boolean>(false);

  const maintainFocus = useCallback(() => {
    if (wasFocused.current && inputRef.current && document.activeElement !== inputRef.current) {
      // Use requestAnimationFrame to ensure DOM updates are complete
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    }
  }, []);

  const handleFocus = useCallback(() => {
    wasFocused.current = true;
  }, []);

  const handleBlur = useCallback(() => {
    wasFocused.current = false;
  }, []);

  // Monitor for potential focus loss and restore if needed
  useEffect(() => {
    const checkFocus = () => {
      if (wasFocused.current && inputRef.current && document.activeElement !== inputRef.current) {
        maintainFocus();
      }
    };

    const interval = setInterval(checkFocus, 100);
    return () => clearInterval(interval);
  }, [maintainFocus]);

  return {
    inputRef,
    handleFocus,
    handleBlur,
    maintainFocus
  };
};
