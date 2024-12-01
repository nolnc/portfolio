// AudioClassifierProject.jsx

import './SoundsLikeItStyles.css';
import React, { useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AudioClassifierProvider, AudioClassifierAdapterCtx } from '../AudioClassifier/AudioClassifierAdapterCtx';
import { SoundsLikeItManagerProvider, SoundsLikeItManagerCtx } from './SoundsLikeItManagerCtx';
import { CountdownProvider, CountdownContext } from './CountdownContext';
import Countdown from './Countdown';
import { Visualizer } from 'react-sound-visualizer';
import { SoundsLikeItProvider, SoundsLikeItContext } from './SoundsLikeItContext';

function InnerSoundsLikeItProject() {
  const { initializeAudioClassifier, isAudioClassifierReady } = useContext(AudioClassifierAdapterCtx);
  const { setCount } = useContext(CountdownContext);
  const { soundSelectElemRef } = useContext(SoundsLikeItContext);
  const { startAudioClassification, disableMic, micState, micStreamAvailable,
    resumeAudioContext, suspendAudioContext, micStreamRef, soundImages, getSoundImageSrc,
   } = useContext(SoundsLikeItManagerCtx);
  
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

  const handleSoundSelection = async (e) => {
    const selectedImageName = e.target.value;
    const selectedImage = soundImages.find((image) => image.name === selectedImageName);
    if (selectedImage) {
      document.getElementById("sound-img").src = selectedImage.src;
    }
  };

  const handleStartCountdownClick = async () => {
    setCount(3);
  };

  return (
    <div className="SoundsLikeItProject">
      <div id="detector-container">
        <h2>Sounds Like It</h2>
        <p>Now let's make some noise!</p>
        <div id="output-container">
          <div className="choose-sound-container">
            <img id="sound-img" src={getSoundImageSrc("Dog")} alt="sound image"/>
            <div className="sound-dropdown" onClick={handleSoundSelection}>
              <select id="sound-select" ref={soundSelectElemRef} defaultValue="Dog">
                {soundImages.map((image, index) => (
                  <option className="sound-item" key={index} value={image.name}>
                    {image.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Countdown/>
            <button id="start-button" onClick={handleStartCountdownClick}>Start</button>
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
    <SoundsLikeItProvider>
      <AudioClassifierProvider>
        <SoundsLikeItManagerProvider>
          <CountdownProvider>
            <InnerSoundsLikeItProject />
          </CountdownProvider>
        </SoundsLikeItManagerProvider>
      </AudioClassifierProvider>
    </SoundsLikeItProvider>
  );
}

export default SoundsLikeItProject;