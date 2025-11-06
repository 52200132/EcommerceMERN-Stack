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

export const useRenderCountStore = create(
  immer((set, get) => ({
    activeComponents: [],
    addComponent: (name) => set((state) => {
      state.activeComponents.push(name);
    }),
    removeComponent: (name) => set((state) => {
      state.activeComponents = state.activeComponents.filter(c => c !== name);
    }),
    getComponentIndex: (name) => get().activeComponents.indexOf(name)
  }))
);