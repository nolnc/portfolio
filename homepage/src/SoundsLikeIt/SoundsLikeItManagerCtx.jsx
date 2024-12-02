// SoundsLikeItManagerCtx.jsx

// Manages the audio classifier requests.

import React, { createContext, useState, useRef, useContext } from 'react';
import { AudioClassifierAdapterCtx } from '../AudioClassifier/AudioClassifierAdapterCtx';

import sound_img_bee from './images/bee.jfif';
import sound_img_bird from './images/bird.jfif';
import sound_img_cat from './images/cat.png';
import sound_img_chicken from './images/chicken.jfif';
import sound_img_cow from './images/cow.jfif';
import sound_img_cricket from './images/cricket.jfif';
import sound_img_crow from './images/crow.jfif';
import sound_img_dog from './images/dog.jfif';
import sound_img_duck from './images/duck.jfif';
import sound_img_frog from './images/frog.jfif';
import sound_img_goat from './images/goat.jfif';
import sound_img_goose from './images/goose.jfif';
import sound_img_horse from './images/horse.jfif';
import sound_img_lion from './images/lion.jfif';
import sound_img_mouse from './images/mouse.jfif';
import sound_img_owl from './images/owl.jfif';
import sound_img_pig from './images/pig.jfif';
import sound_img_pigeon from './images/pigeon.jfif';
import sound_img_rooster from './images/rooster.jfif';
import sound_img_snake from './images/snake.png';

const SoundsLikeItManagerCtx = createContext();

const SoundsLikeItManagerProvider = ({ children }) => {

  const { audioClassifier, isAudioClassifierReady } = useContext(AudioClassifierAdapterCtx);

  const [micStreamAvailable, setMicStreamAvailable] = useState(false);
  const [micState, setMicState] = useState("INACTIVE");
  const audioCtxRef = useRef(null);
  const scriptNodeRef = useRef(null);
  const audioWorkletNodeRef = useRef(null);
  const micStreamRef = useRef(null);
  const soundSelectElemRef = useRef(null);
  const [maxScore, setMaxScore] = useState(0);

  const soundImages = [
    { name: 'Bee',     src: sound_img_bee },
    { name: 'Bird',    src: sound_img_bird },
    { name: 'Cat',     src: sound_img_cat },
    { name: 'Chicken', src: sound_img_chicken },
    { name: 'Cow',     src: sound_img_cow },
    { name: 'Cricket', src: sound_img_cricket },
    { name: 'Crow',    src: sound_img_crow },
    { name: 'Dog',     src: sound_img_dog },
    { name: 'Duck',    src: sound_img_duck },
    { name: 'Frog',    src: sound_img_frog },
    { name: 'Goat',    src: sound_img_goat },
    { name: 'Goose',   src: sound_img_goose },
    { name: 'Horse',   src: sound_img_horse },
    { name: 'Lion',    src: sound_img_lion },
    { name: 'Mouse',   src: sound_img_mouse },
    { name: 'Owl',     src: sound_img_owl },
    { name: 'Pig',     src: sound_img_pig },
    { name: 'Pigeon',  src: sound_img_pigeon },
    { name: 'Rooster', src: sound_img_rooster },
    { name: 'Snake',   src: sound_img_snake },
  ];

  const soundMap = new Map([
    ["Bee",     ["Bee, wasp, etc."]],
    ["Bird",    ["Bird", "Bird vocalization, bird call, bird song"]],
    ["Cat",     ["Cat", "Meow", "Purr"]],
    ["Chicken", ["Chicken, rooster", "Cluck", "Fowl"]],
    ["Cow",     ["Cattle, bovinae", "Moo"]],
    ["Cricket", ["Cricket"]],
    ["Crow",    ["Caw", "Crow"]],
    ["Dog",     ["Bark", "Dog"]],
    ["Duck",    ["Duck", "Quack"]],
    ["Frog",    ["Frog"]],
    ["Goat",    ["Bleat", "Goat"]],
    ["Goose",   ["Goose"]],
    ["Horse",   ["Horse", "Neigh, whinny"]],
    ["Lion",    ["Roaring cats (lions, tigers)"]],
    ["Mouse",   ["Mouse"]],
    ["Owl",     ["Owl"]],
    ["Pig",     ["Pig"]],
    ["Pigeon",  ["Coo", "Pigeon, dove"]],
    ["Rooster", ["Crowing, cock-a-doodle-doo"]],
    ["Sheep",   ["Sheep"]],
    ["Snake",   ["Snake"]],
  ]);
  
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
    console.log("Updating results");
    const categories = result[0].classifications[0].categories;
    
    if (!soundSelectElemRef.current) {
      console.log("Cannot access selected value");
      return;
    }
    const labelsToLookFor = soundMap.get(soundSelectElemRef.current.value);
    let resultText = "";

    for (let index = 0; index < categories.length; index++) {
      const category = categories[index];
      //console.log("(" + category.score + ") " + category.categoryName);
      if (category.score >= 0.01) {
        if (labelsToLookFor.some((label) => category.categoryName.includes(label))) {
          const score = Math.round(parseFloat(category.score) * 100);
          console.log("score=" + score + " maxScore=" + maxScore + " label=" + category.categoryName);
          if (score > maxScore) {
            setMaxScore(score);
          }
          resultText += `${score}% ${category.categoryName}\n`;
        }
      }
    }

    const resultElem = document.getElementById("mic-result");
    if (resultElem) {
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
    micState,
    micStreamAvailable,
    micStreamRef,
    soundImages,

    audioCtxRef,
    scriptNodeRef,
    audioWorkletNodeRef,
    micStreamRef,
    maxScore,
    setMaxScore,
    soundSelectElemRef,
    startAudioClassification,
    disableMic,
    resumeAudioContext,
    suspendAudioContext,
  };

  return (
    <SoundsLikeItManagerCtx.Provider value={ soundsLikeItManagerShared }>
      {children}
    </SoundsLikeItManagerCtx.Provider>
  );
};

export { SoundsLikeItManagerProvider, SoundsLikeItManagerCtx };
