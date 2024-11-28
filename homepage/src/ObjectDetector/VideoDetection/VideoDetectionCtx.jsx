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
  const [videoElem, setVideoElem] = useState(null);
  const [liveViewElem, setLiveViewElem] = useState(null);
  let animationId;
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
      setVideoElem(document.getElementById("videoCam"));
      setLiveViewElem(document.getElementById("liveView"));
      //console.log("initDOMElements() document.readyState=" + document.readyState + " videoElem=" + document.getElementById("videoCam"));
    }
    else {
      console.log("DOM elements not loaded yet");
      document.addEventListener('DOMContentLoaded', function () {
        console.log("DOM Content Loaded");
        setVideoElem(document.getElementById("videoCam"));
        setLiveViewElem(document.getElementById("liveView"));
        //console.log("initDOMElements() DOMContentLoaded videoElem=" + document.getElementById("videoCam"));
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
    console.log("enableCam() videoElem=" + videoElem);
    if (!objectDetector || !isObjectDetectorReady) {
      console.log("Wait! objectDetector not loaded yet.");
      return;
    }

    if (objectDetector.runningMode !== "VIDEO") {
      //console.log("scoreThreshold=" + scoreThreshold);
      await objectDetector.setOptions({ runningMode: "VIDEO", score: scoreThreshold });
    }

    if (!videoElem) {
      console.log("Wait! video not ready yet.");
      return;
    }

    const cameraSelect = document.getElementById('camera-select');
    const selectedCameraId = cameraSelect.value;
    const selectedOption = cameraSelect.options[cameraSelect.selectedIndex];
    const facingMode = selectedOption.dataset.facingMode;
    console.log("selectedCameraId=" + selectedCameraId);
    console.log("selectedOption=" + selectedOption);
    console.log("facingMode=" + facingMode);

    if ((videoElem.dataset.flipped === "false") && (facingMode === "environment")) {
      console.log("Flip video");
      videoElem.style.transform = "rotateY(180deg)";
      videoElem.style.WebkitTransform = "rotateY(180deg)";
      videoElem.style.MozTransform = "rotateY(180deg)";
      videoElem.dataset.flipped = "true";
    }
    else {
      console.log("Video flipping not needed");
      videoElem.style.transform = "";
      videoElem.style.WebkitTransform = "";
      videoElem.style.MozTransform = "";
      videoElem.dataset.flipped = "false";
    }

    const constraints = {
      video: {
        deviceId: selectedCameraId
      }
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        //console.log("getUserMedia() got stream");
        videoElem.srcObject = stream;
        videoElem.addEventListener("loadeddata", predictVideoFrame);
      })
      .catch((err) => {
        console.error('Camera access denied or failed:', err);
        alert('Camera access denied or failed. Please check browser permissions.');
        cameraSelect.selectedIndex = 0;
      });
  };

  async function predictVideoFrame() {
    let startTimeMs = performance.now();
    //console.log("video.currentTime=" + video.currentTime + " lastVideoTime=" + lastVideoTime);
    
    if (videoElem.currentTime !== lastVideoTime) {
      //console.log("Attempt video object detect timeMs=" + startTimeMs);
      lastVideoTime = videoElem.currentTime;
      const detections = objectDetector.detectForVideo(videoElem, startTimeMs);
      displayVideoDetections(detections);
    }
    animationId = window.requestAnimationFrame(predictVideoFrame);
    //console.log("predictVideoFrame() animationId=" + animationId);
  };

  function clearVideoOverlay() {
    for (let child of videoOverlayElems) {
      liveViewElem.removeChild(child);
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
  
      const pTxt = document.createElement("p");
      pTxt.setAttribute("class", "overlay-text");
      pTxt.innerText = categoryName + " " + scorePercent + "%";
      pTxt.style =
          "color: " + highlightColorStyle + ";" +
          "left: " + (videoElem.offsetWidth - detection.boundingBox.width - detection.boundingBox.originX) + "px;" +
          "top: " + detection.boundingBox.originY + "px; " +
          "width: " + (detection.boundingBox.width - 10) + "px;";
  
      const highlighter = document.createElement("div");
      highlighter.setAttribute("class", "overlay-box");
      highlighter.style =
          "border-color: " + highlightColorStyle + ";" +
          "left: " + (videoElem.offsetWidth - detection.boundingBox.width - detection.boundingBox.originX) + "px;" +
          "top: " + detection.boundingBox.originY + "px;" +
          "width: " + detection.boundingBox.width + "px;" +
          "height: " + detection.boundingBox.height + "px;";
  
      pDetectElem.appendChild(highlighter);
      pDetectElem.appendChild(pTxt);
  
      liveViewElem.appendChild(pDetectElem);
      videoOverlayElems.push(pDetectElem);
    }
    setVideoDetectionCategories(categorySet);
  };

  const disableCam = async (videoCamElem) => {
    console.log("disableCam() videoCamElem=" + videoCamElem);
    if (videoCamElem) {
      if (videoCamElem.srcObject) {
        const tracks = videoCamElem.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoCamElem.srcObject = null;
        videoCamElem.removeEventListener("loadeddata", predictVideoFrame);
        //console.log("disableCam() animationId=" + animationId);
        window.cancelAnimationFrame(animationId);
        animationId = null;
      }
    }
  };

  /*
  const hasGetUserMedia = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };
  */

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