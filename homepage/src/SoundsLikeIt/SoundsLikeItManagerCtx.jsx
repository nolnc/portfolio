// SoundsLikeItManagerCtx.jsx

// Manages the audio classifier requests.

import React, { createContext, useContext, useState, useRef } from 'react';
import { AudioClassifierAdapterCtx } from '../AudioClassifier/AudioClassifierAdapterCtx';

const SoundsLikeItManagerCtx = createContext();

const SoundsLikeItManagerProvider = ({ children }) => {

  const { audioClassifier, isAudioClassifierReady } = useContext(AudioClassifierAdapterCtx);

  const [micStreamAvailable, setMicStreamAvailable] = useState(false);
  const [micState, setMicState] = useState("INACTIVE");
  const audioCtxRef = useRef(null);
  const scriptNodeRef = useRef(null);
  const audioWorkletNodeRef = useRef(null);
  const micStreamRef = useRef(null);

  async function startAudioClassification() {
    console.log("startAudioClassification()");
    if (!audioClassifier || !isAudioClassifierReady) {
      console.log("Wait! audioClassifier not loaded yet.");
      return;
    }

    await getMicrophone();

    console.log("startAudioClassification() audioCtxRef=" + audioCtxRef.current +
      " micStream=" + micStreamRef.current);
    if (!audioCtxRef.current && micStreamRef.current) {
      console.log("Creating new audio context");
      audioCtxRef.current = new AudioContext({ sampleRate: 16000 });
      
      const source = audioCtxRef.current.createMediaStreamSource(micStreamRef.current);

      // Create script node
      scriptNodeRef.current = audioCtxRef.current.createScriptProcessor(16384, 1, 1);
      scriptNodeRef.current.onaudioprocess = function (audioProcessingEvent) {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        let inputData = inputBuffer.getChannelData(0);
        const result = audioClassifier.classify(inputData);
        displayResult(result);
      };

      /*
      // Load the audio processor worklet
      try {
        await audioCtxRef.current.audioWorklet.addModule('audioProcessor.js');
        console.log("audio processor file loaded");
      } catch (error) {
        console.error('Error loading audio processor module:', error);
      }

      audioWorkletNodeRef.current = new AudioWorkletNode(
        audioCtxRef.current, 'audio-processor',
        { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] }
      );

      // Port the script processor logic to the AudioWorkletProcessor
      audioWorkletNodeRef.current.port.onmessage = function (event) {
        //console.log("audioWorkletNodeRef onmessage event=" + event);
        const inputData = event.data;
        const result = audioClassifier.classify(inputData);
        displayResult(result);
      };
      */
    
      // Connect the nodes
      source.connect(scriptNodeRef.current);
      scriptNodeRef.current.connect(audioCtxRef.current.destination);
      //source.connect(audioWorkletNodeRef.current);
      //audioWorkletNodeRef.current.connect(audioCtxRef.current.destination);

      await audioCtxRef.current.resume();
      setMicState("RUNNING");
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
      //console.log("getUserMedia() micStream=" + micStreamRef.current);
      micStreamRef.current = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("micStream=" + micStreamRef.current);
      setMicStreamAvailable(true);
    }
    catch (err) {
      console.log("Error initializing microphone: " + err);
      alert("getUserMedia not supported on your browser");
    }
  }

  function displayResult(result) {
    console.log("Updating #mic-result");
    const categories = result[0].classifications[0].categories;
    const resultElem = document.getElementById("mic-result");
    if (resultElem) {
      let resultText = "";
      let resultCnt = 0;
      for (let index = 0; index < categories.length; index++) {
        const category = categories[index];
        if ((resultCnt < 5) && (category.score > 0.009)) {
          ++resultCnt;
          resultText += `${Math.round(parseFloat(category.score) * 100)}% ${category.categoryName}\n`;
        } else {
          break;
        }
      }
      //console.log(resultText);
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
    console.log("disableMic() stream=" + micStreamRef.current + " audioWorkletNode=" + audioWorkletNodeRef.current + " audioCtx=" + audioCtxRef.current);
    try {
      // Close media stream
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      // Disconnect script node
      if (scriptNodeRef.current) {
        scriptNodeRef.current.disconnect();
      }
      /*
      // Disconnect AudioWorkletNode
      if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.disconnect();
      }
      */
      // Close audio context
      if (audioCtxRef.current) {
        await audioCtxRef.current.close();
      }
      // Remove all references
      micStreamRef.current = null;
      scriptNodeRef.current = null;
      //audioWorkletNodeRef.current = null;
      audioCtxRef.current = null;
      setMicState("INACTIVE");
    } catch (error) {
      console.error("Error disabling microphone:", error);
    }
  };

  const soundsLikeItManagerShared = {
    startAudioClassification,
    disableMic,
    micState,
    //getMicStream: () => micStreamRef.current, // controlled access
    micStreamAvailable,
    getMicrophone,
    resumeAudioContext,
    suspendAudioContext,
    micStreamRef,
  };

  return (
    <SoundsLikeItManagerCtx.Provider value={ soundsLikeItManagerShared }>
      {children}
    </SoundsLikeItManagerCtx.Provider>
  );
};

export { SoundsLikeItManagerProvider, SoundsLikeItManagerCtx };
