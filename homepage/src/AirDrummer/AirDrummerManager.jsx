// AirDrummerManager.jsx

// Handles the DOM access and manipulations needed by AirDrummerManagerCtx

import React, { useRef, useContext, useEffect } from 'react';
import { AirDrummerManagerCtx } from './AirDrummerManagerCtx';

const AirDrummerManager = () => {

  const { enableCam, frontCamExistsRef, videoElemRef, canvasElemRef,
    currentCamId, setCurrentCamId,
   } = useContext(AirDrummerManagerCtx);

  const isFirstTime = useRef(true);
  useEffect(() => {
    if (isFirstTime.current) {
      isFirstTime.current = false;
      populateCameraDropdown();
    }
  }, []);

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
          frontCamExistsRef.current = true;
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
    if (videoElemRef.current.dataset.flipped === "false") {
      console.log("Flipping video");
      videoElemRef.current.style.transform = "rotateY(180deg)";
      videoElemRef.current.style.WebkitTransform = "rotateY(180deg)";
      videoElemRef.current.style.MozTransform = "rotateY(180deg)";
      videoElemRef.current.dataset.flipped = "true";
      canvasElemRef.current.style.transform = "rotateY(180deg)";
      canvasElemRef.current.style.WebkitTransform = "rotateY(180deg)";
      canvasElemRef.current.style.MozTransform = "rotateY(180deg)";
    }
    else {
      console.log("Unflipping video");
      videoElemRef.current.style.transform = "";
      videoElemRef.current.style.WebkitTransform = "";
      videoElemRef.current.style.MozTransform = "";
      videoElemRef.current.dataset.flipped = "false";
      canvasElemRef.current.style.transform = "";
      canvasElemRef.current.style.WebkitTransform = "";
      canvasElemRef.current.style.MozTransform = "";
    }
  };

  return (
    <div className="air-drummer-manager">
      <div id="video-button-group">
        <div className="camera-dropdown" onClick={handleCameraSelectedClick}>
          <select id="camera-select">
            <option value="" disabled selected data-facing-mode="environment">Please select a camera</option>
          </select>
        </div>
        <button id="flip-video-button" onClick={handleFlipVideoToggleClick}>Flip Video</button>
      </div>
      <div className="video-container">
        <video id="video-cam" autoPlay playsInline data-flipped="false" ref={videoElemRef}></video>
        <canvas id="hand-canvas" ref={canvasElemRef}></canvas>
      </div>
    </div>
  );
};

export default AirDrummerManager;