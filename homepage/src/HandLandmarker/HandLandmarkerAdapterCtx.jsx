// HandLandmarkerAdapterCtx.jsx
// Adapter for MediaPipe Hand Landmarker API
// Ref: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker
//    handLandmarker = Handle to the MediaPipe Hand Landmarker
//    runningMode = task mode {IMAGE, VIDEO, LIVE_STREAM}
//    isHandLandmarkerReady = Indicates if hand landmarker is initialized/loaded
// HandLandmarker class API: https://ai.google.dev/edge/api/mediapipe/js/tasks-vision.handlandmarker

import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { createContext, useState } from 'react';

const HandLandmarkerAdapterCtx = createContext();

const HandLandmarkerAdapterProvider = ({ children }) => {
  const [isHandLandmarkerReady, setIsHandLandmarkerReady] = useState(false);
  const [handLandmarker, setHandLandmarker] = useState(null);

  let initialized = false;
  const initializeHandLandmarker = async () => {
    if (!initialized) {
      try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm");
        setHandLandmarker(
          await HandLandmarker.createFromOptions(
            vision,
            { baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
              },
              runningMode: "IMAGE",
              numHands: 2
            }
          )
        );
        initialized = true;
        setIsHandLandmarkerReady(true);
      }
      catch (error) {
          console.error('initializeHandLandmarker error:', error);
          alert('Problem initializing HandLandmarker');
      }
    }
    console.log("HandLandmarker already initialized");
  };

  const handLandmarkerShared = {
    handLandmarker,
    isHandLandmarkerReady,
    initializeHandLandmarker
  };

  return (
    <HandLandmarkerAdapterCtx.Provider value={ handLandmarkerShared }>
      {children}
    </HandLandmarkerAdapterCtx.Provider>
  );
};

export { HandLandmarkerAdapterProvider, HandLandmarkerAdapterCtx };
