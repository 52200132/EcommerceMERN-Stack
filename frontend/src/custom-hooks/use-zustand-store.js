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
/**
 * Store quản lý các hàm uploader được đăng ký
 */
export const useUploadersRegistry = create(
  immer((set, get) => ({
    uploadersFuncs: {},
    setUploader: (key, uploader) => set((state) => {
      state.uploadersFuncs[key] = uploader;
    }),
    getUploader: (key) => get().uploadersFuncs[key],
    getUploaderFuncs: () => Object.values(get().uploadersFuncs),
    removeUploader: (key) => set((state) => {
      delete state.uploadersFuncs[key];
    }),
  }))
);