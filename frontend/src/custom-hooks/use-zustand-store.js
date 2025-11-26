import ProfileForm from '#components/profile/profile-form';
import AddressForm from '#components/profile/address-form';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
export { useShallow } from 'zustand/shallow';

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

export const OFF_CANVAS_BODY_KEYS = {
  PROFILE_FORM: 'profileForm',
  ADDRESS_FORM: 'addressForm',
};

export const useOffCanvasStore = create(
  immer((set, get) => ({
    offCanvasBodies: {
      [OFF_CANVAS_BODY_KEYS.PROFILE_FORM]: { title: 'Cập nhật hồ sơ', component: <ProfileForm /> },
      [OFF_CANVAS_BODY_KEYS.ADDRESS_FORM]: { title: 'Địa chỉ', component: <AddressForm /> },
    },
    defaultFormValues: {},
    offCanvasBodyProps: {},
    activateOffCanvasBody: { title: '', component: null },
    show: false,
    setShow: (value) => set((state) => {
      state.show = value;
    }),
    setOffCanvasBody: (key, body) => set((state) => {
      state.offCanvasBodies[key] = body;
    }),
    setOffCanvasBodyProps: (props) => set((state) => {
      state.offCanvasBodyProps = props;
    }),
    setDefaultFormValues: (values) => set((state) => {
      state.defaultFormValues = values;
    }),
    getOffCanvasBodyProps: () => get().offCanvasBodyProps,
    getOffCanvasBody: (key) => get().offCanvasBodies[key],
    removeOffCanvasBody: (key) => set((state) => {
      delete state.offCanvasBodies[key];
    }),
    setActiveOffCanvasBody: (key) => set((state) => {
      // console.log('Setting active offcanvas body to key:', key);
      state.activateOffCanvasBody = state.offCanvasBodies[key];
    }),
    getActiveOffCanvasBody: () => get().activateOffCanvasBody,
  }))
);