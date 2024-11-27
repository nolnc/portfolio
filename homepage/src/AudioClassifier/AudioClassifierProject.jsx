// AudioClassifierProject.jsx

import './AudioClassifierStyles.css';
import React, { useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AudioClassifierProvider, AudioClassifierAdapterCtx } from './AudioClassifierAdapterCtx';
import { AudioClassifierManagerProvider, AudioClassifierManagerCtx } from './AudioClassifierManagerCtx';

function InnerAudioClassifierProject() {
  const { initializeAudioClassifier, isAudioClassifierReady } = useContext(AudioClassifierAdapterCtx);
  const { setupAudioClassification, disableMic, micState,
    resumeAudioContext, suspendAudioContext } = useContext(AudioClassifierManagerCtx);

  const micButtonMap = {
    INACTIVE:  "START",
    RUNNING:   "SUSPEND",
    SUSPENDED: "RESUME"
  };

  const isFirstTime = useRef(true);
  useEffect(() => {
    console.log("AudioClassifierProject useEffect() init");
    if (isFirstTime.current) {
      console.log("AudioClassifierProject useEffect() init first time");
      isFirstTime.current = false;
      initializeAudioClassifier();
    }
  }, []);

  useEffect(() => {
    console.log("AudioClassifierProject useEffect() init isAudioClassifierReady=" + isAudioClassifierReady);
    if (isAudioClassifierReady) {
      console.log("isAudioClassifierReady=" + isAudioClassifierReady);
      setupAudioClassification();
    }
  }, [isAudioClassifierReady]);

  const location = useLocation();
  useEffect(() => {
    return () => {
      if (location.pathname === '/audio-classifier') {
        disableMic();
      }
    };
  }, [location.pathname]);

  const handleClick = async () => {
    if (micState === "RUNNING") {
      suspendAudioContext();
    } else {
      resumeAudioContext();
    }
  };

  return (
    <div className="AudioClassifierProject">
      <div id="detector-container">
        <h2>Stream audio classifications</h2>
        <p>Check out the repository for this project: <a href="https://github.com/nolnc/audio-classifier" target="_blank" rel="noreferrer">audio-classifier</a>.</p>
        <div>Click <b>Start</b> to turn enable the microphone and make some noise!</div>
        <button id="mic-start-button" onClick={handleClick}>{micButtonMap[micState]}</button>
        <div id="mic-result"></div>
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