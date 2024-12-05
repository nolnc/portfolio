// HandLandmarkerCtx.jsx

// Manages the hand landmark requests

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { HandLandmarkerAdapterCtx } from './HandLandmarkerAdapterCtx';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

const HandLandmarkerCtx = createContext();

const HandLandmarkerProvider = ({ children }) => {
  const [videoDetectionCategories, setVideoDetectionCategories] = useState(new Set());
  const [videoEnabled, setVideoEnabled] = useState(false);
  const videoElemRef = useRef(null);
  const liveViewElemRef = useRef(null);
  let animationId;
  let videoOverlayElems = [];
  let lastVideoTime = -1;

  const { handLandmarker, isHandLandmarkerReady, } = useContext(HandLandmarkerAdapterCtx);

  const isFirstTime = useRef(true);
  useEffect(() => {
    if (isFirstTime.current) {
      isFirstTime.current = false;
      initDOMElements();
    }
  }, []);

  function initDOMElements() {
    if (document.readyState !== 'loading') {
      console.log("Already loaded");
      videoElemRef.current = document.getElementById("videoCam");
      liveViewElemRef.current = document.getElementById("liveView");
    }
    else {
      console.log("DOM elements not loaded yet");
      document.addEventListener('DOMContentLoaded', function () {
        console.log("DOM Content Loaded");
        videoElemRef.current = document.getElementById("videoCam");
        liveViewElemRef.current = document.getElementById("liveView");
      });
    };
  };

  function populateCameraDropdown() {
    navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      const cameraSelect = document.getElementById('camera-select');
      const cameras = devices.filter(device => device.kind === 'videoinput');

      cameras.forEach((camera, index) => {
        const option = document.createElement('option');
        option.value = camera.deviceId;
        option.text = camera.label;
        console.log("option.text=" + option.text);

        // Check the camera label to determine the facing mode
        if (camera.label.includes('front')) {
          option.dataset.facingMode = "user";
        }
        else {
          option.dataset.facingMode = "environment";
        }
        /*
        else {
          // If the label doesn't indicate the facing mode, use getCapabilities()
          navigator.mediaDevices.getUserMedia({ video: { deviceId: camera.deviceId } })
            .then(stream => {
              const track = stream.getVideoTracks()[0];
              const capabilities = track.getCapabilities();
              if (capabilities.facingMode === 'user') {
                option.dataset.facingMode = "user";        // facing user
              } else if (capabilities.facingMode === 'environment') {
                option.dataset.facingMode = "environment"; // facing away from user
              }
            })
            .catch(error => {
              console.error('Error getting camera capabilities:', error);
            });
        }
        */
        console.log("option.dataset.facingMode=" + option.dataset.facingMode);

        cameraSelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error enumerating devices:', error);
    });
  }

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

    if (facingMode === "user") {
      console.log("Flip video");
      videoElemRef.current.style.transform = "rotateY(180deg)";
      videoElemRef.current.style.WebkitTransform = "rotateY(180deg)";
      videoElemRef.current.style.MozTransform = "rotateY(180deg)";
      videoElemRef.current.dataset.flipped = "true";
    }
    else {
      console.log("Video flipping not needed");
      videoElemRef.current.style.transform = "";
      videoElemRef.current.style.WebkitTransform = "";
      videoElemRef.current.style.MozTransform = "";
      videoElemRef.current.dataset.flipped = "false";
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
        cameraSelect.selectedIndex = 0;
      });

    setVideoEnabled(true);
  };

  async function predictVideoFrame() {
    let startTimeMs = performance.now();
    console.log("video.currentTime=" + videoElemRef.current.currentTime + " lastVideoTime=" + lastVideoTime);
    
    if (videoElemRef.current.currentTime !== lastVideoTime) {
      console.log("Attempt video object detect timeMs=" + startTimeMs);
      lastVideoTime = videoElemRef.current.currentTime;
      const detections = handLandmarker.detectForVideo(videoElemRef.current, startTimeMs);
      displayVideoDetections(detections);
    }
    animationId = window.requestAnimationFrame(predictVideoFrame);
    //console.log("predictVideoFrame() animationId=" + animationId);
  };

  function displayVideoDetections(results) {
    const canvasElement = document.getElementById("output_canvas");
    const canvasCtx = canvasElement.getContext("2d");
    console.log("displayVideoDetections() id=" + canvasElement.id);
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5
        });
        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }
    canvasCtx.restore();
  };

  const disableCam = async () => {
    console.log("disableCam() videoElem=" + videoElemRef.current);
    if (videoElemRef.current) {
      if (videoElemRef.current.srcObject) {
        const tracks = videoElemRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoElemRef.current.srcObject = null;
        videoElemRef.current.removeEventListener("loadeddata", predictVideoFrame);
        //console.log("disableCam() animationId=" + animationId);
        window.cancelAnimationFrame(animationId);
        animationId = null;
        setVideoEnabled(false);
      }
    }
  };

  const handLandmarkerShared = {
    enableCam,
    disableCam,
    populateCameraDropdown,
  };

  return (
    <HandLandmarkerCtx.Provider value={handLandmarkerShared}>
      {children}
    </HandLandmarkerCtx.Provider>
  );
};

export { HandLandmarkerProvider, HandLandmarkerCtx };