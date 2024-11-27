// AudioClassifierAdapterCtx.jsx

// Adapter for MediaPipe Audio Classifier API
// Ref: https://ai.google.dev/edge/mediapipe/solutions/audio/audio_classifier
//    audioClassifier = Handle to the MediaPipe Audio Classifier
//    runningMode = task mode {AUDIO_CLIPS, AUDIO_STREAM}
//    isAudioClassifierReady = Indicates if the audio classifier is initialized/loaded
// AudioClassifier class API: https://ai.google.dev/edge/api/mediapipe/js/tasks-audio.audioclassifier#audioclassifier_class

import { AudioClassifier, FilesetResolver } from "@mediapipe/tasks-audio";
import { createContext, useState } from 'react';

const AudioClassifierAdapterCtx = createContext();

const AudioClassifierProvider = ({ children }) => {
  const [isAudioClassifierReady, setIsAudioClassifierReady] = useState(false);
  const [audioClassifier, setAudioClassifier] = useState(null);

  const initializeAudioClassifier = async () => {
    if (isAudioClassifierReady) {
      console.log("AudioClassifier already initialized");
      return;
    }
    try {
      const audioFileset = await FilesetResolver.forAudioTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-audio@0.10.0/wasm");
      setAudioClassifier(
        await AudioClassifier.createFromOptions(
          audioFileset,
          { baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/audio_classifier/yamnet/float32/1/yamnet.tflite",
              delegate: "GPU"
            },
            //scoreThreshold: 0.5,
            //maxResults: 2
          }
        )
      );
      setIsAudioClassifierReady(true);
      console.log("Audio Classifier is ready");
    }
    catch (error) {
      console.error('initializeAudioClassifier error:', error);
      alert('Problem initializing audio classifier');
    }
  };

  const audioClassifierShared = {
    audioClassifier,
    isAudioClassifierReady,
    initializeAudioClassifier
  };

  return (
    <AudioClassifierAdapterCtx.Provider value={ audioClassifierShared }>
      {children}
    </AudioClassifierAdapterCtx.Provider>
  );
};

export { AudioClassifierProvider, AudioClassifierAdapterCtx };
