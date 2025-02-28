// HandLandmarkerProject.jsx

import './HandLandmarkerStyles.css';
import React, { useEffect, useRef, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HandLandmarkerAdapterProvider, HandLandmarkerAdapterCtx } from './HandLandmarkerAdapterCtx';
import { HandLandmarkerProvider, HandLandmarkerCtx } from './HandLandmarkerCtx';

function InnerHandLandmarkerProject() {

  const { initializeHandLandmarker } = useContext(HandLandmarkerAdapterCtx);
  const { cameraFound, enableCam, disableCam, populateCameraDropdown } = useContext(HandLandmarkerCtx);
  const [currentCamId, setCurrentCamId] = useState("");

  const isFirstTime = useRef(true);
  useEffect(() => {
    if (isFirstTime.current) {
      isFirstTime.current = false;
      initializeHandLandmarker();
      populateCameraDropdown();
    }
  }, [initializeHandLandmarker, populateCameraDropdown]);

  const location = useLocation();
  useEffect(() => {
    return () => {
      if (location.pathname === '/hand-landmarker') {
        disableCam();
      }
    };
  }, [location.pathname]);

  const handleCameraSelectedClick = async () => {
    const cameraSelect = document.getElementById('camera-select');
    const selectedCameraId = cameraSelect.value;
    console.log("selectedCameraId=" + selectedCameraId);
    if (currentCamId != selectedCameraId) {
      setCurrentCamId(selectedCameraId);
      enableCam();
    }
  };

  const handleFlipVideoToggleClick = async () => {
    const videoCamElem = document.getElementById("videoCam");
    const canvasElem = document.getElementById("output_canvas");
    if (videoCamElem.dataset.flipped === "false") {
      console.log("Flipping video");
      videoCamElem.style.transform = "rotateY(180deg)";
      videoCamElem.style.WebkitTransform = "rotateY(180deg)";
      videoCamElem.style.MozTransform = "rotateY(180deg)";
      videoCamElem.dataset.flipped = "true";
      canvasElem.style.transform = "rotateY(180deg)";
      canvasElem.style.WebkitTransform = "rotateY(180deg)";
      canvasElem.style.MozTransform = "rotateY(180deg)";
    }
    else {
      console.log("Unflipping video");
      videoCamElem.style.transform = "";
      videoCamElem.style.WebkitTransform = "";
      videoCamElem.style.MozTransform = "";
      videoCamElem.dataset.flipped = "false";
      canvasElem.style.transform = "";
      canvasElem.style.WebkitTransform = "";
      canvasElem.style.MozTransform = "";
    }
  };

  const handleSitePermissionClick = async () => {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      populateCameraDropdown();
    })
    .catch(error => {
      if (error.name === 'NotAllowedError') {
        // Camera permission denied, prompt the user to grant permission
        console.log('Camera permission denied. Please grant permission to continue.');
      } else {
        console.error('Error accessing camera:', error);
      }
    });
  };

  return (
    <div className="HandLandmarkerProject">
      <div className="project-container">
        <div className="project-title">Hand Landmark Detection</div>
        <p>This project uses the MediaPipe HandLandmarker task.</p>
        <p>The source for this project will be found in: <a href="https://github.com/nolnc/portfolio/tree/main/homepage/src/HandLandmarker" target="_blank" rel="noreferrer">HandLandmarker source</a>.</p>
        <div className="detector-container">
          <h2>Continuous camera detection</h2>
          <div id="video-button-group">
            <div className="camera-dropdown" onClick={handleCameraSelectedClick}>
              <select id="camera-select">
                <option value="" disabled selected data-facing-mode="environment">Please select a camera</option>
              </select>
            </div>
            {!cameraFound && <button id="update-permission-button" onClick={handleSitePermissionClick}>Update Site Permission</button>}
            {cameraFound && <button id="flip-video-button" onClick={handleFlipVideoToggleClick}>Flip Video</button>}
          </div>
          <div id="liveView" className="videoView">
            <video id="videoCam" autoPlay playsInline data-flipped="false"></video>
            <canvas className="output_canvas" id="output_canvas"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

// Context provider wrappers
function HandLandmarkerProject() {
  return (
    <HandLandmarkerAdapterProvider>
      <HandLandmarkerProvider>
        <InnerHandLandmarkerProject/>
      </HandLandmarkerProvider>
    </HandLandmarkerAdapterProvider>
  );
}

export default HandLandmarkerProject;