// SoundsLikeItContext.jsx

import React, { useRef, createContext } from 'react';

const SoundsLikeItContext = createContext();

const SoundsLikeItProvider = ({ children }) => {
  const soundSelectElemRef = useRef(null);

  const soundLikeItShared = {
    soundSelectElemRef
  };

  return (
    <SoundsLikeItContext.Provider value={soundLikeItShared}>
      {children}
    </SoundsLikeItContext.Provider>
  );
};

export { SoundsLikeItProvider, SoundsLikeItContext };