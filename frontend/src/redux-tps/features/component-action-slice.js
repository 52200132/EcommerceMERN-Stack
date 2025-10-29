import { createSlice, current } from "@reduxjs/toolkit";

const initialState = {
  // action: null,
};

const ComponentActionSlice = createSlice({
  name: "component-action",
  initialState,
  reducers: {
    createTriggerAction: (state, action) => {
      const { triggerKey } = action.payload;
      if (state[triggerKey] === undefined) {
        state[triggerKey] = false
      }
    },
    triggerAction: (state, action) => {
      const { triggerKey } = action.payload;
      current(state);
      if (state[triggerKey] === false && state[triggerKey] !== undefined) {
        state[triggerKey] = true;
      }
    },
    resetTriggerAction: (state, action) => {
      const { triggerKey } = action.payload;
      if (state[triggerKey] !== undefined) {
        state[triggerKey] = false;
      }
    },
  },
});

export const { createTriggerAction, triggerAction, resetTriggerAction } = ComponentActionSlice.actions;

export default ComponentActionSlice.reducer;
