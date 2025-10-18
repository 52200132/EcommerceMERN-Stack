import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  show: false,
  modalName: '',
  title: '',
  // component: () => <div>nội dung</div>,
  componentName: '',
  componentProps: {},
  type: '', // 'add' | 'edit' | 'view'
}

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setShow: (state) => {
      state.show = true
    },
    setHide: (state) => {
      state.show = false
    },
    changeContent: (state, action) => {
      const { componentName, title, componentProps } = action.payload
      // state.component = component
      state.componentName = componentName
      state.title = title
      state.componentProps = componentProps
    },
  },
})

export const { setShow, setHide, changeContent } = modalSlice.actions
export default modalSlice.reducer
