import { useEffect } from "react";

export const useScrollTo = (top = 0, behavior = 'smooth', deps = []) => {
  useEffect(() => {
    window.scrollTo({ top, behavior });
  }, [top, behavior]);

  useEffect(() => {
    if (deps.length === 0) return;
    window.scrollTo({ top, behavior });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, deps.length, top, behavior]);
}