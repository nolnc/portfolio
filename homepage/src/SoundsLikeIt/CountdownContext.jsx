// CountdownContext.jsx

import React, { useState, createContext } from 'react';

const CountdownContext = createContext();

const CountdownProvider = ({ children }) => {
  const [count, setCount] = useState(0);

  const countdownShared = {
    count,
    setCount,
  };

  return (
    <CountdownContext.Provider value={countdownShared}>
      {children}
    </CountdownContext.Provider>
  );
};

export { CountdownProvider, CountdownContext };