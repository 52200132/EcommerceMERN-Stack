import { useEffect } from "react";

export const useScrollTo = (top = 0, behavior = 'smooth', deps = []) => {
  useEffect(() => {
    window.scrollTo({ top, behavior });
  }, [top, behavior]);

  useEffect(() => {
    window.scrollTo({ top, behavior });
  }, deps);
}