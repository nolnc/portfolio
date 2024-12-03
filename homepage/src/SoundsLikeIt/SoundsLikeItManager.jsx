// SoundsLikeItManager.jsx

import React, { useState, useContext, useEffect } from 'react';
import { SoundsLikeItManagerCtx } from './SoundsLikeItManagerCtx';
import Countdown from './Countdown';
import { CountdownContext } from './CountdownContext';

const SoundsLikeItManager = () => {
  const {
    soundImages,
    soundSelectElemRef,
    maxScore,
  } = useContext(SoundsLikeItManagerCtx);
  const { setCount } = useContext(CountdownContext);
  const [started, setStarted] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    let scaledScore = maxScore;
    console.log("scaledScore=" + scaledScore + " currentScore=" + currentScore);
    if (scaledScore > currentScore) {
        setCurrentScore(scaledScore);
    }
  }, [maxScore]);

  const getSoundImageSrc = (name) => {
    const image = soundImages.find((image) => image.name === name);
    return image ? image.src : null;
  };

  const handleSoundSelection = async (e) => {
    const selectedImageName = e.target.value;
    const selectedImage = soundImages.find((image) => image.name === selectedImageName);
    if (selectedImage) {
      document.getElementById("sounds-like-it-img").src = selectedImage.src;
    }
  };

  const populateDropDown = (soundImages) => {
    return (
      soundImages.map((image, index) => (
        <option className="sound-item" key={index} value={image.name}>
          {image.name}
        </option>
      ))
    );
  };

  const handleStartCountdownClick = async () => {
    setCurrentScore(0);
    setStarted(true);
    setCount(10);
  };

  const onCountdownFinished = () => {
    setStarted(false);
  };

  return (
    <div className="sounds-like-it-manager">
      <img id="sounds-like-it-img" src={getSoundImageSrc("Dog")} alt="sound like it"/>

      <div id="controls-overlay">
        <div id="overlay-full">
          <div id="overlay-top">
            {started &&
            <div id="score-text-backing">
              <div id="score-text">Score: {currentScore}</div>
            </div>}
          </div>
          <div id="overlay-mid">
            {!started && <button id="start-button" onClick={handleStartCountdownClick}>Start</button>}
            <Countdown preText="" onFinished={onCountdownFinished}/>
          </div>
          <div id="overlay-bottom">
            <div className="sound-dropdown" onClick={handleSoundSelection}>
              <select id="sound-select" ref={soundSelectElemRef} defaultValue="Dog">
                  {populateDropDown(soundImages)}
              </select>
            </div>
          </div>
        </div>
      </div>
      {/*
      <div id="countdown-overlay">
        <Countdown ref={runningCountdownRef} preText=""/>
      </div>
      */}
    </div>
  );
};

export default SoundsLikeItManager;