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
  const micStreamRef = useRef(null);

  /*
  const hasGetUserMedia = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };
  */

  async function startAudioClassification() {
    console.log("startAudioClassification()");
    if (!audioClassifier || !isAudioClassifierReady) {
      console.log("Wait! audioClassifier not loaded yet.");
      return;
    }

    await getMicrophone();

    if (!audioCtxRef.current && micStreamRef.current) {
      console.log("Creating new audio context");
      audioCtxRef.current = new AudioContext({ sampleRate: 16000 });
      await audioCtxRef.current.resume();
      setMicState("RUNNING");

      const source = audioCtxRef.current.createMediaStreamSource(micStreamRef.current);
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
    else {
      console.log("Unable to start audio classifier");
    }
  };

  async function getMicrophone() {
    const constraints = {
      audio: true
    };
    try {
      console.log("getUserMedia() micStreamRef.current=" + micStreamRef.current);
      micStreamRef.current = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("micStreamRef.current=" + micStreamRef.current);
    }
    catch (err) {
      console.log("Error initializing microphone: " + err);
      alert("getUserMedia not supported on your browser");
    }
  }

  function displayResult(result) {
    if (result) {
      const categories = result[0].classifications[0].categories;
      const resultElem = document.getElementById("mic-result");
      let resultText = "";
      let resultCnt = 0;
      categories.forEach((category, index) => {
        if ((resultCnt < 5) && (category.score > 0.009)) {
          ++resultCnt;
          resultText += `${Math.round(parseFloat(category.score) * 100)}% ${category.categoryName}\n`;
        }
      });
      resultElem.innerText = resultText;
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
    console.log("disableMic() stream=" + micStreamRef.current + " scriptNode=" + scriptNodeRef.current + " audioCtx=" + audioCtxRef.current);
    try {
      // Close media stream
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      // Disconnect script node
      if (scriptNodeRef.current) {
        scriptNodeRef.current.disconnect();
      }
      // Close audio context
      if (audioCtxRef.current) {
        await audioCtxRef.current.close();
      }
      // Remove all references
      micStreamRef.current = null;
      scriptNodeRef.current = null;
      audioCtxRef.current = null;
      setMicState("INACTIVE");
    } catch (error) {
      console.error("Error disabling microphone:", error);
    }
  };

  const audioClassifierManagerShared = {
    startAudioClassification,
    disableMic,
    micState,
    getMicStream: () => micStreamRef.current, // controlled access
    getMicrophone,
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
