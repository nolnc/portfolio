// AirDrummerManagerCtx.jsx

// Manages the Air Drummer main functionality

import React, { createContext, useState, useRef, useContext, useEffect } from 'react';
import { HandLandmarkerAdapterCtx } from '../HandLandmarker/HandLandmarkerAdapterCtx';

const AirDrummerManagerCtx = createContext();

const AirDrummerManagerProvider = ({ children }) => {

  const { handLandmarker, isHandLandmarkerReady, initializeHandLandmarker } = useContext(HandLandmarkerAdapterCtx);

  const [videoEnabled, setVideoEnabled] = useState(false);
  const videoElemRef = useRef(null);
  const canvasElemRef = useRef(null);
  const animationIdRef = useRef(null);
  let lastVideoTime = -1;
  const frontCamExistsRef = useRef(false);
  const [currentCamId, setCurrentCamId] = useState("");

  const drumAElemRef = useRef(null);
  const drumBElemRef = useRef(null);
  const cymbalAElemRef = useRef(null);
  const cymbalBElemRef = useRef(null);

  //const rightHandPt = useRef(null);
  //const leftHandPt = useRef(null);
  const [rightHandPt, setRightHandPt] = useState(null);
  const [leftHandPt, setLeftHandPt] = useState(null);
  const [showHands, setShowHands] = useState(true);

  const isFirstTime = useRef(true);
  useEffect(() => {
    if (isFirstTime.current) {
      isFirstTime.current = false;
      initializeHandLandmarker();
    }
  }, [initializeHandLandmarker]);

  async function enableCam() {
    console.log("enableCam() videoElem=" + videoElemRef.current);
    if (!handLandmarker || !isHandLandmarkerReady) {
      console.log("Wait! handLandmarker not loaded yet.");
      return;
    }

    if (handLandmarker.runningMode !== "VIDEO") {
      await handLandmarker.setOptions({ runningMode: "VIDEO" });
    }

    if (!videoElemRef.current) {
      console.log("Wait! video not ready yet.");
      return;
    }

    if (videoEnabled) {
      console.log("Disabling previous camera.");
      await disableCam();
    }

    const cameraSelect = document.getElementById('camera-select');
    const selectedCameraId = cameraSelect.value;
    const selectedOption = cameraSelect.options[cameraSelect.selectedIndex];
    const facingMode = selectedOption.dataset.facingMode;
    console.log("selectedCameraId=" + selectedCameraId);
    console.log("selectedOption=" + selectedOption);
    console.log("facingMode=" + facingMode);

    if (!frontCamExistsRef.current || (frontCamExistsRef.current && (facingMode === "user"))) {
      console.log("Flip video");
      videoElemRef.current.style.transform = "rotateY(180deg)";
      videoElemRef.current.style.WebkitTransform = "rotateY(180deg)";
      videoElemRef.current.style.MozTransform = "rotateY(180deg)";
      videoElemRef.current.dataset.flipped = "true";
      canvasElemRef.current.style.transform = "rotateY(180deg)";
      canvasElemRef.current.style.WebkitTransform = "rotateY(180deg)";
      canvasElemRef.current.style.MozTransform = "rotateY(180deg)";
    }
    else {
      console.log("Video flipping not needed");
      videoElemRef.current.style.transform = "";
      videoElemRef.current.style.WebkitTransform = "";
      videoElemRef.current.style.MozTransform = "";
      videoElemRef.current.dataset.flipped = "false";
      canvasElemRef.current.style.transform = "";
      canvasElemRef.current.style.WebkitTransform = "";
      canvasElemRef.current.style.MozTransform = "";
    }

    const constraints = {
      video: {
        deviceId: selectedCameraId
      }
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        //console.log("getUserMedia() got stream");
        videoElemRef.current.srcObject = stream;
        videoElemRef.current.addEventListener("loadeddata", predictVideoFrame);
      })
      .catch((err) => {
        console.error('Camera access denied or failed:', err);
        alert('Camera access denied or failed. Please check browser permissions.');
        //cameraSelect.selectedIndex = 0;
      });

    setVideoEnabled(true);
  };

  async function predictVideoFrame() {
    let startTimeMs = performance.now();
    //console.log("video.currentTime=" + videoElemRef.current.currentTime + " lastVideoTime=" + lastVideoTime);
    
    if (videoElemRef.current.currentTime !== lastVideoTime) {
      //console.log("Attempt video object detect timeMs=" + startTimeMs);
      lastVideoTime = videoElemRef.current.currentTime;
      const detections = handLandmarker.detectForVideo(videoElemRef.current, startTimeMs);
      saveHandPositions(detections);
      console.log("predictVideoFrame pre showHands=" + showHands);
      if (showHands) {
        console.log("predictVideoFrame showHands=" + showHands);
        displayVideoDetections(detections);
      }
    }
    animationIdRef.current = window.requestAnimationFrame(predictVideoFrame);
    //console.log("predictVideoFrame() animationId=" + animationIdRef.current);
  };

  function saveHandPositions(results) {
    for (let h = 0; h < results.landmarks.length; h++) {
      const landmarkArr = results.landmarks[h];
      const hand = results.handednesses[h][0];
      // Use midpoint of hand to mark hand position.
      // Also swap the hand positions
      if (hand.categoryName === "Left") {
        setRightHandPt(landmarkArr[9]);
        //rightHandPt.current.x = 1.0 - rightHandPt.current.x;
        //console.log("rightHandPt: x=" + rightHandPt.current.x + " y=" + rightHandPt.current.y);
        //console.log("rightHandPt=" + rightHandPt);
      }
      else {
        setLeftHandPt(landmarkArr[9]);
        //leftHandPt.current.x = 1.0 - leftHandPt.current.x;
        //console.log("leftHandPt: x=" + leftHandPt.current.x + " y=" + leftHandPt.current.y);
        //console.log("leftHandPt=" + leftHandPt);
      }
    }
  };

  function displayVideoDetections(results) {
    // Result format:
    // results = {
    //   landmarks      = [landmarkSet0, landmarkSet1, ...],
    //   worldLandmarks = [worldLandmarkSet0, worldLandmarkSet1, ...],
    //   handednesses   = [[hand0], [hand1], ...],
    //   handedness     = [hand0, hand1, ...],    // deprecated
    //}
    // landmarkSetX      = [point0, point1, ...]
    // worldLandmarkSetX = [point0, point1, ...]
    // pointX            = {x, y, z, visibility}
    // handX             = {score, index, categoryName, displayName}

    // handednesses   - contains the classification results for each detected hand
    // handedness     - (deprecated) represent the handedness of a single hand
    // landmarks      - normalized to image coordinate system
    // worldLandmarks - real-world coordinate system in meters

    //console.log("results:", results);

    /*
    // Print landmarks
    console.log("results.landmarks:", results.landmarks);
    for (let i = 0; i < results.landmarks.length; i++) {
      const landmark = results.landmarks[i];
      console.log(`Landmark ${i}:`);
      for (let j = 0; j < landmark.length; j++) {
        const point = landmark[j];
        console.log(`Point ${j}: x = ${point.x}, y = ${point.y}, z = ${point.z}, visibility = ${point.visibility}`);
      }
    }

    // Print world landmarks
    console.log("results.worldLandmarks:", results.worldLandmarks);
    for (let i = 0; i < results.worldLandmarks.length; i++) {
      const landmark = results.worldLandmarks[i];
      console.log(`World Landmark ${i}:`);
      for (let j = 0; j < landmark.length; j++) {
        const point = landmark[j];
        console.log(`Point ${j}: x = ${point.x}, y = ${point.y}, z = ${point.z}, visibility = ${point.visibility}`);
      }
    }

    // Print handednesses
    console.log("results.handednesses:", results.handednesses);
    for (let i = 0; i < results.handednesses.length; i++) {
      const handedness = results.handednesses[i];
      console.log(`Handedness ${i}: score = ${handedness.score}, index = ${handedness.index}, categoryName = ${handedness.categoryName}, displayName = ${handedness.displayName}`);
    }
    */



    const canvasCtx = canvasElemRef.current.getContext("2d");
    //console.log("displayVideoDetections() id=" + canvasElemRef.current.id);
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElemRef.current.width, canvasElemRef.current.height);

    const connectingLines = [
      [0, 1, 2, 5, 9, 13, 17, 0],
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
      [17, 18, 19, 20],
    ];

    let landmarkOptions;
    let lineOptions;

    // Draw landmarks
    for (let i = 0; i < results.landmarks.length; i++) {
      //console.log("i=" + i + " landmarks.len=" + results.landmarks.length);
      const handedness = results.handednesses[i][0];
      //console.log(`Handedness ${i}: score = ${handedness.score}, index = ${handedness.index}, categoryName = ${handedness.categoryName}, displayName = ${handedness.displayName}`);
      
      if (handedness.categoryName === "Left") {
        landmarkOptions = { size: 1, color: 'green' };
        lineOptions = { width: 1, color: 'orange' };
      }
      else {
        landmarkOptions = { size: 1, color: 'red' };
        lineOptions = { width: 1, color: 'blue' };
      }
      canvasCtx.strokeStyle = lineOptions.color;
      canvasCtx.lineWidth = lineOptions.width;
      
      const landmarkList = results.landmarks[i];

      // Connect points
      for (const line of connectingLines) {
        for (let k = 1; k < line.length; ++k) {
          const from = landmarkList[line[k - 1]];
          const to = landmarkList[line[k]];

          const x1 = from.x * canvasElemRef.current.width;
          const y1 = from.y * canvasElemRef.current.height;
          const x2 = to.x * canvasElemRef.current.width;
          const y2 = to.y * canvasElemRef.current.height;
          canvasCtx.beginPath();
          canvasCtx.moveTo(x1, y1);
          canvasCtx.lineTo(x2, y2);
          canvasCtx.stroke();
        }
      }

      // Draw points
      for (const point of landmarkList) {
        //console.log(`Point: x = ${point.x}, y = ${point.y}, z = ${point.z}, visibility = ${point.visibility}`);
        const x = point.x * canvasElemRef.current.width;
        const y = point.y * canvasElemRef.current.height;
        //const z = point.z;
        //const visibility = point.visibility;
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, landmarkOptions.size, 0, 2 * Math.PI);
        canvasCtx.fillStyle = landmarkOptions.color;
        canvasCtx.fill();
      }
    }
    canvasCtx.restore();
  };

  const disableCam = async () => {
    //console.log("disableCam() videoElem=" + videoElemRef.current);
    if (videoElemRef.current) {
      if (videoElemRef.current.srcObject) {
        const tracks = videoElemRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoElemRef.current.srcObject = null;
      }
      videoElemRef.current.removeEventListener("loadeddata", predictVideoFrame);
      //console.log("disableCam() animationId=" + animationIdRef.current);
      window.cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
      setVideoEnabled(false);
    }
  };

  const airDrummerManagerShared = {
    enableCam,
    disableCam,
    frontCamExistsRef,
    videoElemRef,
    canvasElemRef,
    currentCamId,
    setCurrentCamId,
    drumAElemRef,
    drumBElemRef,
    cymbalAElemRef,
    cymbalBElemRef,
    rightHandPt,
    leftHandPt,
    showHands,
    setShowHands,
  };

  return (
    <AirDrummerManagerCtx.Provider value={ airDrummerManagerShared }>
      {children}
    </AirDrummerManagerCtx.Provider>
  );
};

export { AirDrummerManagerProvider, AirDrummerManagerCtx };
