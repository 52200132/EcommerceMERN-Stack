import { createContext, useState, useContext } from "react";

const AContext = createContext();

const AProvider = (props) => {
  const { children } = props

  const [SELECTORS, setSELECTORS] = useState({});

  // Dữ liệu + hàm logic được chia sẻ
  const value = { SELECTORS, setSELECTORS };

  return (
    <AContext.Provider value={value}>
      {children}
    </AContext.Provider>
  );
}

export default AProvider;

// custom hook cho gọn
export function useAContext() {
  return useContext(AContext);
}
