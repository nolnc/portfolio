import './AudioClassifierStyles.css';
import React, { useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AudioClassifierProvider, AudioClassifierAdapterCtx } from './AudioClassifierAdapterCtx';
import { AudioClassifierManagerProvider, AudioClassifierManagerCtx } from './AudioClassifierManagerCtx';

function InnerAudioClassifierProject() {
  const { initializeAudioClassifier } = useContext(AudioClassifierAdapterCtx);
  const { startAudioClassification, disableMic } = useContext(AudioClassifierManagerCtx);

  const isFirstTime = useRef(true);
  useEffect(() => {
    console.log("AudioClassifierProject useEffect() init");
    if (isFirstTime.current) {
      isFirstTime.current = false;
      initializeAudioClassifier();
    }
  }, []);

  const location = useLocation();
  useEffect(() => {
    return () => {
      if (location.pathname === '/audio-classifier') {
        disableMic();
      }
    };
  }, [location.pathname]);

  const handleClick = async () => {
    startAudioClassification();
  };

  return (
    <div className="AudioClassifierProject">
      <div id="detector-container">
        <h2>Stream audio classifications</h2>
        <p>Check out the repository for this project: <a href="https://github.com/nolnc/audio-classifier" target="_blank" rel="noreferrer">audio-classifier</a>.</p>
        <div>Click <b>Start Classifying</b> to start streaming classifications of your own audio.</div>
        <button id="mic-start-button" onClick={handleClick}>START</button>
        <button onClick={disableMic}>Disable Mic</button>
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