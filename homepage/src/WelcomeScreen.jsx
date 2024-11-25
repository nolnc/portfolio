// WelcomeScreen.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import background_img from './images/flowing_circuit_board.webp';

function WelcomeScreen() {

  const [isVisible, setIsVisible] = useState(true);

  const navigate = useNavigate();

  function handleWelcomeClick() {
    transitionToMain();
  }

  function handleAnimationEnd() {
    transitionToMain();
  }

  function transitionToMain() {
    setIsVisible(false);
    navigate('/main');
  };

  return (
    <div id="welcome-screen" onClick={handleWelcomeClick} onAnimationEnd={handleAnimationEnd}
      style={{ display: isVisible ? 'block' : 'none' }}>
      <img className="background-img" src={background_img} alt="background"/>
      <div className="circular-gradient"></div>
      <div className="welcome-text">
        <div id="top_text">Welcome</div>
        <div id="mid_text">to</div>
        <div id="bot_text">NC Lab</div>
        <div className="welcome-progress-bar">
          <div className="welcome-progress" id="welcome-progress"></div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
