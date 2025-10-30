import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useSelectorStore = create(
  immer((set, get) => ({
    selectors: {},

    setSelector: (key, selector) => set((state) => {
      state.selectors[key] = selector;
    }),

    getSelector: (key) => get().selectors[key],

    removeSelector: (key) => set((state) => {
      delete state.selectors[key];
    }),
  }))
);
