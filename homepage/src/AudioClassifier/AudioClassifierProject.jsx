// AudioClassifierProject.jsx

import './AudioClassifierStyles.css';
import React, { useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AudioClassifierProvider, AudioClassifierAdapterCtx } from './AudioClassifierAdapterCtx';
import { AudioClassifierManagerProvider, AudioClassifierManagerCtx } from './AudioClassifierManagerCtx';
import { Visualizer } from 'react-sound-visualizer';

function InnerAudioClassifierProject() {
  const { initializeAudioClassifier, isAudioClassifierReady } = useContext(AudioClassifierAdapterCtx);
  const { startAudioClassification, disableMic, micState, micStreamAvailable,
    resumeAudioContext, suspendAudioContext, micStreamRef } = useContext(AudioClassifierManagerCtx);

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
      //getMicrophone();
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
      if (location.pathname === '/audio-classifier') {
        disableMic();
      }
    };
  }, [location.pathname]);

  const handleMicButtonClick = async () => {
    try {
      if (micState === "RUNNING") {
        await suspendAudioContext();
      } else {
        await resumeAudioContext();
      }
    } catch (error) {
      console.error("Error handling mic button click:", error);
    }
  };

  return (
    <div className="AudioClassifierProject">
      <div className="project-container">
        <div className="project-title">Audio Stream Classifier</div>
        <p>Check out the repository for this project: <a href="https://github.com/nolnc/audio-classifier" target="_blank" rel="noreferrer">audio-classifier</a>.</p>
        <p>Now let's make some noise!</p>
        <div id="output-container">
          {micStreamAvailable ?
            ( <Visualizer audio={micStreamRef.current} autoStart="true" strokeColor="#ffec46">
                {({ canvasRef, stop, start, reset }) => (
                  <>
                    <canvas ref={canvasRef} />
                    {/*<div>
                      <button onClick={start}>Start</button>
                      <button onClick={stop}>Stop</button>
                      <button onClick={reset}>Reset</button>
                    </div>*/}
                  </>
                )}
              </Visualizer>
            ) : (<p>Waiting for microphone stream...</p>)
          }
          <button id="mic-button" onClick={handleMicButtonClick}>{micButtonMap[micState]}</button>
          <div id="mic-result"></div>
        </div>
      </div>
    </div>
  );
}

// Context provider wrapper for AudioClassifierProject 
function AudioClassifierProject() {
  return (
    <AudioClassifierProvider>
      <AudioClassifierManagerProvider>
        <InnerAudioClassifierProject />
      </AudioClassifierManagerProvider>
    </AudioClassifierProvider>
  );
}

export default AudioClassifierProject;