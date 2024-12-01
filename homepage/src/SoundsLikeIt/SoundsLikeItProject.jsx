// AudioClassifierProject.jsx

import './SoundsLikeItStyles.css';
import React, { useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AudioClassifierProvider, AudioClassifierAdapterCtx } from '../AudioClassifier/AudioClassifierAdapterCtx';
import { SoundsLikeItManagerProvider, SoundsLikeItManagerCtx } from './SoundsLikeItManagerCtx';
import { CountdownProvider, CountdownContext } from './CountdownContext';
import Countdown from './Countdown';
import { Visualizer } from 'react-sound-visualizer';


import sound_img_bee from './images/bee.jfif';
import sound_img_cat from './images/cat.png';
import sound_img_chicken from './images/chicken.jfif';
import sound_img_cow from './images/cow.jfif';
import sound_img_crow from './images/crow.jfif';
import sound_img_dog from './images/dog.jfif';
import sound_img_duck from './images/duck.jfif';
import sound_img_goat from './images/goat.jfif';
import sound_img_horse from './images/horse.jfif';
import sound_img_pig from './images/pig.jfif';

function InnerSoundsLikeItProject() {
  const { initializeAudioClassifier, isAudioClassifierReady } = useContext(AudioClassifierAdapterCtx);
  const { startAudioClassification, disableMic, micState, micStreamAvailable,
    resumeAudioContext, suspendAudioContext, micStreamRef } = useContext(SoundsLikeItManagerCtx);
  const { setCount } = useContext(CountdownContext);

  const micButtonMap = {
    INACTIVE:  "START",
    RUNNING:   "SUSPEND",
    SUSPENDED: "RESUME"
  };

  const isFirstTime = useRef(true);
  useEffect(() => {
    if (isFirstTime.current) {
      isFirstTime.current = false;
      initializeAudioClassifier();
    }
  }, []);

  // Make sure audio classifier model is ready before feeding it
  useEffect(() => {
    if (isAudioClassifierReady) {
      console.log("isAudioClassifierReady=" + isAudioClassifierReady);
      startAudioClassification();
    }
  }, [isAudioClassifierReady]);

  // Disable mic when leaving page
  const location = useLocation();
  useEffect(() => {
    return () => {
      if (location.pathname === '/sounds-like-it') {
        disableMic();
      }
    };
  }, [location.pathname]);

  const handleMicButtonClick = async () => {
    try {
      if (micState === "RUNNING") {
        suspendAudioContext();
      } else {
        resumeAudioContext();
      }
    } catch (error) {
      console.error("Error handling mic button click:", error);
    }
  };

  const handleSoundSelection = async () => {

  };

  const handleStartCountdownClick = async () => {
    setCount(10);
  };

  return (
    <div className="SoundsLikeItProject">
      <div id="detector-container">
        <h2>Sounds Like It</h2>
        <p>Now let's make some noise!</p>
        <div id="output-container">
          <div className="choose-sound-container">
            <img className="sound-img" src={sound_img_dog} alt="sound image"/>
            <div className="sound-dropdown" onClick={handleSoundSelection}>
              <select id="sound-select">
                <option value="">Please select a sound</option>
              </select>
            </div>
          </div>
          <button id="mic-button" onClick={handleMicButtonClick}>{micButtonMap[micState]}</button>
          <div>
            <Countdown/>
            <button onClick={handleStartCountdownClick}>Start Countdown</button>
          </div>
          {micStreamAvailable ?
            ( <Visualizer audio={micStreamRef.current} autoStart="true" strokeColor="#450d50">
                {({ canvasRef }) => (
                  <>
                    <canvas ref={canvasRef} />
                  </>
                )}
              </Visualizer>
            ) : (<p>Waiting for microphone stream...</p>)
          }
          <div id="mic-result"></div>
        </div>
      </div>
    </div>
  );
}

// Context provider wrapper for SoundsLikeItProject 
function SoundsLikeItProject() {
  return (
    <AudioClassifierProvider>
      <SoundsLikeItManagerProvider>
        <CountdownProvider>
          <InnerSoundsLikeItProject />
        </CountdownProvider>
      </SoundsLikeItManagerProvider>
    </AudioClassifierProvider>
  );
}

export default SoundsLikeItProject;