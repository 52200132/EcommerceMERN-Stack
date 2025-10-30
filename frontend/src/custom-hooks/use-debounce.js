import { useEffect, useRef } from "react";

export const useDebounceSubscribeValues = (callback, subscribe, delay = 500) => {
  const timeoutRef = useRef(null);
  useEffect(() => {
    let lastValues
    let saved = undefined
    // make sure to unsubscribe;
    const subscription = subscribe({
      formState: {
        values: true,
      },
      callback: ({ values }) => {
        lastValues = values;
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          saved = callback(values);
        }, delay);
      },
    })

    return () => {
      clearTimeout(timeoutRef.current);
      subscription();
      if (lastValues && !saved) callback(lastValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribe, delay]);
}