// AudioClassifierManagerCtx.jsx
// Manages the audio classifier requests.

import React, { createContext, useContext, useState, useRef } from 'react';
import { AudioClassifierAdapterCtx } from './AudioClassifierAdapterCtx';

const AudioClassifierManagerCtx = createContext();

const AudioClassifierManagerProvider = ({ children }) => {

  const { audioClassifier, isAudioClassifierReady } = useContext(AudioClassifierAdapterCtx);

  const [micState, setMicState] = useState("INACTIVE");
  const audioCtxRef = useRef(null);
  const scriptNodeRef = useRef(null);
  const streamRef = useRef(null);

  /*
  const hasGetUserMedia = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };
  */

  async function setupAudioClassification() {
    console.log("setupAudioClassification()");
    if (!audioClassifier || !isAudioClassifierReady) {
      console.log("Wait! audioClassifier not loaded yet.");
      return;
    }

    const constraints = {
      audio: true
    };
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia(constraints);
    }
    catch (err) {
      console.log("Error initializing microphone: " + err);
      alert("getUserMedia not supported on your browser");
    }

    if (!audioCtxRef.current) {
      console.log("Creating new audio context");
      audioCtxRef.current = new AudioContext({ sampleRate: 16000 });
      await audioCtxRef.current.resume();
      setMicState("RUNNING");

      const source = audioCtxRef.current.createMediaStreamSource(streamRef.current);
      scriptNodeRef.current = audioCtxRef.current.createScriptProcessor(16384, 1, 1);
      scriptNodeRef.current.onaudioprocess = function (audioProcessingEvent) {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        let inputData = inputBuffer.getChannelData(0);

        // Classify the audio
        const result = audioClassifier.classify(inputData);
        displayResult(result);
      };
      source.connect(scriptNodeRef.current);
      scriptNodeRef.current.connect(audioCtxRef.current.destination);
    }
  };

  function displayResult(result) {
    if (result) {
      const categories = result[0].classifications[0].categories;
      const resultElem = document.getElementById("mic-result");
      resultElem.innerText =
        Math.round(parseFloat(categories[0].score) * 100) + "% " + categories[0].categoryName + "\n" +
        Math.round(parseFloat(categories[1].score) * 100) + "% " + categories[1].categoryName + "\n" +
        Math.round(parseFloat(categories[2].score) * 100) + "% " + categories[2].categoryName;
    }
  };

  const resumeAudioContext = async () => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === "suspended") {
        console.log("Resuming audio processing");
        await audioCtxRef.current.resume();
        setMicState("RUNNING");
      }
      else {
        console.log("Warning: Attempted to resume audio processing when state is not suspended");
      }
    }
    else {
      console.log("Audio context not created yet");
    }
  }

  const suspendAudioContext = async () => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === "running") {
        console.log("Suspending audio processing");
        await audioCtxRef.current.suspend();
        setMicState("SUSPENDED");
      }
      else {
        console.log("Error: Attempted to suspend audio processing when state is not running");
      }
    }
    else {
      console.log("Audio context not created yet");
    }
  }

  const disableMic = async () => {
    console.log("disableMic() stream=" + streamRef.current + " scriptNode=" + scriptNodeRef.current + " audioCtx=" + audioCtxRef.current);
    
    // Close media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    // Stop audio processing
    if (scriptNodeRef.current) {
      scriptNodeRef.current.disconnect();
      scriptNodeRef.current = null;
    }
    // Release AudioContext
    if (audioCtxRef.current) {
      //await audioCtxRef.current.suspend();
      await audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setMicState("INACTIVE");
  };

  const audioClassifierManagerShared = {
    setupAudioClassification,
    disableMic,
    micState,
    resumeAudioContext,
    suspendAudioContext,
  };

  return (
    <AudioClassifierManagerCtx.Provider value={ audioClassifierManagerShared }>
      {children}
    </AudioClassifierManagerCtx.Provider>
  );
};

export { AudioClassifierManagerProvider, AudioClassifierManagerCtx };
