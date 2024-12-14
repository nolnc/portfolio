// AirDrummerManager.jsx

// Handles the DOM access and manipulations needed by AirDrummerManagerCtx

import React, { useRef, useContext, useEffect } from 'react';
import { AirDrummerManagerCtx } from './AirDrummerManagerCtx';

import drum_set1 from './drum_sets/set1/drum_set1.png';
import drum_set1_drumA from './drum_sets/set1/drumA.mp3';
import drum_set1_drumB from './drum_sets/set1/drumB.mp3';
import drum_set1_cymbalA from './drum_sets/set1/cymbalA.mp3';
import drum_set1_cymbalB from './drum_sets/set1/cymbalB.mp3';

const AirDrummerManager = () => {

  const { enableCam, frontCamExistsRef, videoElemRef, canvasElemRef,
    currentCamId, setCurrentCamId,
    drumAElemRef, drumBElemRef, cymbalAElemRef, cymbalBElemRef,
    rightHandPt, leftHandPt, showHands, setShowHands,
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

  useEffect(() => {
    //console.log("AirDrummerManager useEffect");
    if (rightHandPt) {
      let rightX = (1.0 - rightHandPt.x) * canvasElemRef.current.width;
      let rightY = rightHandPt.y * canvasElemRef.current.height;
      //console.log("useEffect rightHandPt=" + rightX + "," + rightY);
      if ((rightY > 113) && (rightX > 166) && (rightX < 237)) {
        drumAElemRef.current.play();
      }
      if ((rightY > 113) && (rightX > 63) && (rightX < 137)) {
        drumBElemRef.current.play();
      }
      if ((rightX < 66) && (rightY > 52) && (rightY < 82)) {
        cymbalAElemRef.current.play();
      }
      if ((rightX > 232) && (rightY > 59) && (rightY < 85)) {
        cymbalBElemRef.current.play();
      }
    }
    if (leftHandPt) {
      let leftX = (1.0 - leftHandPt.x) * canvasElemRef.current.width;
      let leftY = leftHandPt.y * canvasElemRef.current.height;
      //console.log("useEffect leftHandPt=" + leftX + "," + leftY);
      if ((leftY > 113) && (leftX > 166) && (leftX < 237)) {
        drumAElemRef.current.play();
      }
      if ((leftY > 113) && (leftX > 63) && (leftX < 137)) {
        drumBElemRef.current.play();
      }
      if ((leftX < 66) && (leftY > 52) && (leftY < 82)) {
        cymbalAElemRef.current.play();
      }
      if ((leftX > 232) && (leftY > 59) && (leftY < 85)) {
        cymbalBElemRef.current.play();
      }
    }
  }, [rightHandPt, leftHandPt]);

  const handleCameraSelectedClick = async () => {
    const cameraSelect = document.getElementById('camera-select');
    const selectedCameraId = cameraSelect.value;
    console.log("selectedCameraId=" + selectedCameraId);
    if (currentCamId !== selectedCameraId) {
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

  const handleShowHandsClick = async () => {
    console.log("AirDrummerManager handleShowHandsClick showHands=" + showHands);
    setShowHands(!showHands);
  };

  return (
    <div className="air-drummer-manager">
      <audio id="drumA" src={drum_set1_drumA} ref={drumAElemRef}/>
      <audio id="drumB" src={drum_set1_drumB} ref={drumBElemRef}/>
      <audio id="cymbalA" src={drum_set1_cymbalA} ref={cymbalAElemRef}/>
      <audio id="cymbalB" src={drum_set1_cymbalB} ref={cymbalBElemRef}/>
      <div id="video-button-group">
        <div className="camera-dropdown" onClick={handleCameraSelectedClick}>
          <select id="camera-select">
            <option value="" disabled selected data-facing-mode="environment">Please select a camera</option>
          </select>
        </div>
        <button id="flip-video-button" onClick={handleFlipVideoToggleClick}>Flip Video</button>
        <button id="show-hands-button" onClick={handleShowHandsClick}>
          {showHands ? "Hide Hands" : "Show Hands"}
        </button>
      </div>
      <div className="video-container">
        <video id="video-cam" autoPlay playsInline data-flipped="false" ref={videoElemRef}></video>
        <canvas id="hand-canvas" ref={canvasElemRef}></canvas>
        <img id="drum-set" src={drum_set1} alt="drum set"/>
      </div>
    </div>
  );
};

export default AirDrummerManager;