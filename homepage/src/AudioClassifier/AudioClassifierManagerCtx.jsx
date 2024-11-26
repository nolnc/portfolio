// AudioClassifierManagerCtx.jsx
// Manages the audio classifier requests.

import React, { createContext, useContext } from 'react';
import { AudioClassifierAdapterCtx } from './AudioClassifierAdapterCtx';

const AudioClassifierManagerCtx = createContext();

const AudioClassifierManagerProvider = ({ children }) => {

  let audioCtx = null;
  let scriptNode = null;
  let stream = null;

  const { audioClassifier, isAudioClassifierReady } = useContext(AudioClassifierAdapterCtx);

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

    const constraints = {
      audio: true
    };
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    }
    catch (err) {
      console.log("The following error occured: " + err);
      alert("getUserMedia not supported on your browser");
    }

    const micStartButtonElem = document.getElementById("mic-start-button");

    if (!audioCtx) {
      audioCtx = new AudioContext({ sampleRate: 16000 });
    }
    else if (audioCtx.state === "running") {
      await audioCtx.suspend();
      micStartButtonElem.innerHTML = "CONTINUE";
      return;
    }

    // resumes AudioContext if has been suspended
    await audioCtx.resume();
    micStartButtonElem.innerHTML = "PAUSE";

    const source = audioCtx.createMediaStreamSource(stream);
    scriptNode = audioCtx.createScriptProcessor(16384, 1, 1);
    source.connect(scriptNode);
    scriptNode.connect(audioCtx.destination);
    scriptNode.onaudioprocess = function (audioProcessingEvent) {
      const inputBuffer = audioProcessingEvent.inputBuffer;
      let inputData = inputBuffer.getChannelData(0);

      // Classify the audio
      const result = audioClassifier.classify(inputData);
      displayResult(result);
    };
  };

  function displayResult(result) {
    const categories = result[0].classifications[0].categories;
    const resultElem = document.getElementById("mic-result");
    resultElem.innerText =
      Math.round(parseFloat(categories[0].score) * 100) + "% " + categories[0].categoryName + "\n" +
      Math.round(parseFloat(categories[1].score) * 100) + "% " + categories[1].categoryName + "\n" +
      Math.round(parseFloat(categories[2].score) * 100) + "% " + categories[2].categoryName;
  };

  const disableMic = async () => {
    console.log("disableMic()");

    const micStartButtonElem = document.getElementById("mic-start-button");
    if (micStartButtonElem) {
      micStartButtonElem.innerHTML = "START";
    }

    // Stop audio processing
    if (scriptNode) {
      scriptNode.disconnect();
    }

    // Close media stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Reset AudioContext
    if (audioCtx) {
      await audioCtx.suspend();
    }
  };

  const audioClassifierManagerShared = {
    startAudioClassification,
    disableMic,
  };

  return (
    <AudioClassifierManagerCtx.Provider value={ audioClassifierManagerShared }>
      {children}
    </AudioClassifierManagerCtx.Provider>
  );
};

export { AudioClassifierManagerProvider, AudioClassifierManagerCtx };
