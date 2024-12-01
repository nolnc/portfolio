// Countdown.jsx

import React, { useContext, useEffect, useRef } from 'react';
import { CountdownContext } from './CountdownContext';

const Countdown = () => {
  const { count, setCount } = useContext(CountdownContext);
  const timerIdRef = useRef(null);

  useEffect(() => {
    console.log("Countdown useEffect");
    timerIdRef.current = setInterval(() => {
      console.log("Countdown useEffect count=" + count + " timerId=" + timerIdRef.current);
      if (count > 0) {
        setCount((count) => count - 1);
      }
      else {
        console.log("Countdown at zero. clearInterval timerId=" + timerIdRef.current);
        clearInterval(timerIdRef.current);
      }
    }, 1000);

    return () => {
      console.log("Countdown useEffect clearInterval timerId=" + timerIdRef.current);
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
      }
    }
  }, [count]);

  return (
    <div className="countdown">
      <div>Count: {count}</div>
    </div>
  );
};

export default Countdown;