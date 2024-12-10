// VideoDetectionCtx.jsx

// Manages the object detection requests for videos
//   - Updates the overlay detection rectangles by requesting the last video
//     frame from the video stream and forwarding the frame image to the
//     objectDetector for processing.

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ObjectDetectorAdapterCtx } from '../common/ObjectDetectorAdapterCtx';
//import { ScoreThresholdContext } from '../common/ScoreThresholdContext';
import { stringToHash, capitalizeWords } from '../common/detectionUtils';

const VideoDetectionCtx = createContext();

const VideoDetectionProvider = ({ children }) => {
  const [videoDetectionCategories, setVideoDetectionCategories] = useState(new Set());
  const [videoEnabled, setVideoEnabled] = useState(false);
  const videoElemRef = useRef(null);
  const liveViewElemRef = useRef(null);
  const animationIdRef = useRef(null);
  let videoOverlayElems = [];
  let lastVideoTime = -1;

  const { objectDetector, isObjectDetectorReady } = useContext(ObjectDetectorAdapterCtx);
  //const { scoreThreshold } = useContext(ScoreThresholdContext);
  let scoreThreshold = 0.3;

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
    if (!objectDetector || !isObjectDetectorReady) {
      console.log("Wait! objectDetector not loaded yet.");
      return;
    }

    if (objectDetector.runningMode !== "VIDEO") {
      console.log("Changing objectDetector.runningMode=" + objectDetector.runningMode);
      //console.log("scoreThreshold=" + scoreThreshold);
      await objectDetector.setOptions({ runningMode: "VIDEO", score: scoreThreshold });
    }

    if (!videoElemRef.current) {
      console.log("Wait! video not ready yet.");
      return;
    }

    if (videoEnabled) {
      console.log("Disabling previous camera.");
      await disableCam();
    }

    if (videoEnabled) {
      console.log("Error: Previous camera still enabled!");
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
        console.log("getUserMedia() got stream");
        console.log("videoElemRef.current.srcObject=" + videoElemRef.current.srcObject);
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
    //console.log("video.currentTime=" + video.currentTime + " lastVideoTime=" + lastVideoTime);
    
    if (videoElemRef.current.currentTime !== lastVideoTime) {
      //console.log("Attempt video object detect timeMs=" + startTimeMs);
      lastVideoTime = videoElemRef.current.currentTime;
      const detections = objectDetector.detectForVideo(videoElemRef.current, startTimeMs);
      displayVideoDetections(detections);
    }
    animationIdRef.current = window.requestAnimationFrame(predictVideoFrame);
    //console.log("predictVideoFrame() animationId=" + animationIdRef.current);
  };

  function clearVideoOverlay() {
    console.log("clearVideoOverlay() liveViewElemRef=" + liveViewElemRef.current);
    console.log("videoOverlayElems=" + videoOverlayElems);
    for (let child of videoOverlayElems) {
      console.log("clearVideoOverlay() child=" + child.className);
      liveViewElemRef.current.removeChild(child);
    }
    videoOverlayElems.splice(0);
  };

  function displayVideoDetections(result) {
    clearVideoOverlay();
    const categorySet = new Set();

    for (let detection of result.detections) {
      const categoryName = capitalizeWords(detection.categories[0].categoryName);
      categorySet.add(categoryName);
      const scorePercent = Math.round(parseFloat(detection.categories[0].score) * 100);

      const pDetectElem = document.createElement("div");
      pDetectElem.setAttribute("class", "detection");
      pDetectElem.setAttribute("data-category-name", categoryName);
      pDetectElem.setAttribute("data-score", scorePercent);

      const nameHash = stringToHash(categoryName);
      const r = (nameHash >> 16) & 0xFF;
      const g = (nameHash >> 8) & 0xFF;
      const b = nameHash & 0xFF;
      const highlightColorStyle = "rgb(" + r + "," + g + "," + b + ")";
  
      let left;
      if (videoElemRef.current.dataset.flipped === "false") {
        left = detection.boundingBox.originX;
      } else {
        left = videoElemRef.current.offsetWidth - detection.boundingBox.width - detection.boundingBox.originX;
      }

      const pTxt = document.createElement("p");
      pTxt.setAttribute("class", "videoOverlayText");
      pTxt.innerText = categoryName + " " + scorePercent + "%";
      pTxt.style =
          "color: " + highlightColorStyle + ";" +
          "left: " + left + "px;" +
          "top: " + detection.boundingBox.originY + "px; " +
          "width: " + (detection.boundingBox.width - 10) + "px;";
  
      const highlighter = document.createElement("div");
      highlighter.setAttribute("class", "videoOverlayBox");
      highlighter.style =
          "border-color: " + highlightColorStyle + ";" +
          "left: " + left + "px;" +
          "top: " + detection.boundingBox.originY + "px;" +
          "width: " + detection.boundingBox.width + "px;" +
          "height: " + detection.boundingBox.height + "px;";
  
      pDetectElem.appendChild(highlighter);
      pDetectElem.appendChild(pTxt);
  
      liveViewElemRef.current.appendChild(pDetectElem);
      videoOverlayElems.push(pDetectElem);
    }
    setVideoDetectionCategories(categorySet);
  };

  const disableCam = async () => {
    console.log("disableCam() videoElem=" + videoElemRef.current);
    if (videoElemRef.current) {
      if (videoElemRef.current.srcObject) {
        const tracks = videoElemRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoElemRef.current.srcObject = null;
      }
      videoElemRef.current.removeEventListener("loadeddata", predictVideoFrame);
      console.log("disableCam() animationId=" + animationIdRef.current);
      window.cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
      setVideoEnabled(false);
      console.log("setVideoEnabled(false)");
    }
    clearVideoOverlay();
  };

  const videoDetectionShared = {
    enableCam,
    disableCam,
    populateCameraDropdown,
    videoDetectionCategories,
  };

  return (
    <VideoDetectionCtx.Provider value={videoDetectionShared}>
      {children}
    </VideoDetectionCtx.Provider>
  );
};

export { VideoDetectionProvider, VideoDetectionCtx };