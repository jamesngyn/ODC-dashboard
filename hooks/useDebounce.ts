import { useEffect, useState } from "react";

/**
 * useDebounce - Trả về giá trị debounce sau một khoảng delay
 * @param value - Giá trị cần debounce
 * @param delay - Thời gian delay (ms)
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
