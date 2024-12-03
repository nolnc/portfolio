// Countdown.jsx

import React, { useContext, useEffect, useRef, useState } from 'react';
import { CountdownContext } from './CountdownContext';

const Countdown = ({ preText, onFinished }) => {
  const { count, setCount } = useContext(CountdownContext);
  const [active, setActive] = useState(false);
  const timerIdRef = useRef(null);

  useEffect(() => {
    console.log("Countdown useEffect");
    timerIdRef.current = setInterval(() => {
      console.log("Countdown useEffect count=" + count + " timerId=" + timerIdRef.current);
      if (count > 0) {
        setActive(true);
        setCount((count) => count - 1);
      }
      else {
        console.log("Countdown at zero. clearInterval timerId=" + timerIdRef.current);
        clearInterval(timerIdRef.current);
        setActive(false);
        onFinished();
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
      {active && `${preText}${count}`}
    </div>
  );
};

export default Countdown;