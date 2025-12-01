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

// có thêm cơ chế stack của các bodycomponents [{title, component, props}, {...}]
export const userModalDialogStore = create(
  immer((set, get) => ({
    show: false,
    title: '',
    bodyComponent: null,
    bodyProps: {},
    formValues: {},
    stack: [], // [{title, component, props}, {...}]
    size: 'lg',
    setShow: (value) => set((state) => {
      state.show = value;
      if (!value) {
        state.stack = [];
        state.title = '';
        state.bodyComponent = null;
        state.bodyProps = {};
        state.size = 'lg';
      } else if (value && state.stack.length === 0 && state.bodyComponent) {
        state.stack.push({
          title: state.title,
          bodyComponent: state.bodyComponent,
          bodyProps: state.bodyProps,
          size: state.size,
        });
      }
    }),
    setTitle: (title) => set((state) => {
      state.title = title;
      if (state.stack.length > 0) {
        state.stack[state.stack.length - 1].title = title;
      }
    }),
    setBodyComponent: (component) => set((state) => {
      state.bodyComponent = component;
      if (state.stack.length > 0) {
        state.stack[state.stack.length - 1].bodyComponent = component;
      }
    }),
    setBodyProps: (props) => set((state) => {
      state.bodyProps = props;
      if (state.stack.length > 0) {
        state.stack[state.stack.length - 1].bodyProps = props;
      }
    }),
    setSize: (size) => set((state) => {
      state.size = size;
      if (state.stack.length > 0) {
        state.stack[state.stack.length - 1].size = size;
      }
    }),
    push: ({ title, bodyComponent, bodyProps = {}, size }) => set((state) => {
      const entry = {
        title,
        bodyComponent,
        bodyProps,
        size: size || state.size,
      };
      state.stack.push(entry);
      state.title = entry.title;
      state.bodyComponent = entry.bodyComponent;
      state.bodyProps = entry.bodyProps;
      state.size = entry.size;
      state.show = true;
    }),
    pop: () => set((state) => {
      state.stack.pop();
      const current = state.stack[state.stack.length - 1];
      if (current) {
        state.title = current.title;
        state.bodyComponent = current.bodyComponent;
        state.bodyProps = current.bodyProps || {};
        state.size = current.size || state.size;
        state.show = true;
      } else {
        state.show = false;
        state.title = '';
        state.bodyComponent = null;
        state.bodyProps = {};
        state.size = 'lg';
      }
    }),
    reset: () => set((state) => {
      state.show = false;
      state.title = '';
      state.bodyComponent = null;
      state.bodyProps = {};
      state.stack = [];
      state.size = 'lg';
    }),
  }))
);
