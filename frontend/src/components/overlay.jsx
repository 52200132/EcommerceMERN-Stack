import { useRef } from "react";
import { createPortal  } from "react-dom";

const Overlay = ({ children, closeOverlay, ...props }) => { // children không nên sửa để React tự nhận biết component trong <div>{component}</div>
  const ref = useRef(null);
  const data = { ref };
  console.log('RENDER: overlay');
  return createPortal(
    <div id='tps-overlay'
      // onClick={closeOverlay}
      {...props}
      ref={ref}
    >
      <div className='overlay-content'
        onClick={e => e.stopPropagation()}
      >
        { typeof children === 'function' ? children(data) : children }
      </div>
    </div>,
    document.getElementById('overlay-root')
  )
};

export default Overlay;