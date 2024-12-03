// AudioClassifierProject.jsx

import './SoundsLikeItStyles.css';
import React, { useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AudioClassifierProvider, AudioClassifierAdapterCtx } from '../AudioClassifier/AudioClassifierAdapterCtx';
import { SoundsLikeItManagerProvider, SoundsLikeItManagerCtx } from './SoundsLikeItManagerCtx';
import SoundsLikeItManager from './SoundsLikeItManager';
import { CountdownProvider, CountdownContext } from './CountdownContext';
import Countdown from './Countdown';
import { Visualizer } from 'react-sound-visualizer';

function InnerSoundsLikeItProject() {
  const { initializeAudioClassifier, isAudioClassifierReady } = useContext(AudioClassifierAdapterCtx);
  const { setCount } = useContext(CountdownContext);
  const { micState, micStreamAvailable, micStreamRef,
    startAudioClassification, disableMic, suspendAudioContext, resumeAudioContext
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

  return (
    <div className="SoundsLikeItProject">
      <div id="detector-container">
        <h2>Sounds Like It</h2>
        <p>Try to sound like the creature in the image!</p>
        <div id="output-container">
          <SoundsLikeItManager/>
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