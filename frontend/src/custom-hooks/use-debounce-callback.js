import { useCallback } from "react";

export const useDeBounceCallback = (callback, delay = 1000) => {
  const debounceFn = useCallback(() => {
    let timer;
    let pending;

    return (...args) => {
      // Nếu có promise cũ → hủy
      if (pending) {
        clearTimeout(timer);
      }

      return new Promise((resolve) => {
        timer = setTimeout(async () => {
          const result = callback(...args);
          resolve(result);
          pending = null;
        }, delay);

        pending = timer;
      });
    };
  }, [callback, delay])

  return debounceFn()
}