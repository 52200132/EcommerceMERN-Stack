import { createSlice, current } from '@reduxjs/toolkit'

const initialState = {
  show: false,
  modalName: '',
  title: '',
  // component: () => <div>nội dung</div>,
  componentName: '',
  componentProps: {},
  type: '', // 'add' | 'edit' | 'view'
  stackOfContents: [],
  showBackBtn: false,
}

const setContent = (state, content) => {
  const { title, componentName, componentProps } = content
  current(state.stackOfContents);
  state.title = title
  state.componentName = componentName
  state.componentProps = componentProps
}

const getCurrentContent = (state) => {
  if (state.stackOfContents.length === 0) return null
  state.stackOfContents.pop()
  return state.stackOfContents[state.stackOfContents.length - 1]
}

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setShow: (state) => {
      if (state.stackOfContents.length === 0) return
      state.show = true
    },
    setHide: (state) => {
      state.stackOfContents = []
      state.show = false
    },
    changeContent: (state, action) => {
      const { componentName, title, componentProps } = action.payload
      state.stackOfContents.push({
        componentName,
        title,
        componentProps,
      })
      setContent(state, { componentName, title, componentProps })
      
      if (state.stackOfContents.length > 1) {
        state.showBackBtn = true
      }
    },
    goBack: (state) => {
      if (state.stackOfContents.length > 1) {
        setContent(state, getCurrentContent(state))
        if (state.stackOfContents.length <= 1) state.showBackBtn = false
      } else {
        state.showBackBtn = false
      }
    },
    setModalProps: (state, action) => {
      const modalProps = action.payload
      console.log(modalProps);
      Object.assign(state, modalProps);
    }
  },
})

export const { setShow, setHide, changeContent, goBack, setModalProps } = modalSlice.actions
export default modalSlice.reducer
