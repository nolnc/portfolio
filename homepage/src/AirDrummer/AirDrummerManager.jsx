// AirDrummerManager.jsx

// Handles the DOM access and manipulations needed by AirDrummerManagerCtx

import React, { useRef, useContext, useEffect, useState } from 'react';
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

  const [cameraFound, setCameraFound] = useState(false);  
  const [showInstrumentRegions, setShowInstrumentRegions] = useState(false);
  const instrumentCanvasElemRef = useRef(null);

  const drumARegion = { left: 166, right: 237, top: 113, bottom: 150 };
  const drumBRegion = { left: 63, right: 137, top: 113, bottom: 150 };
  const cymbalARegion = { left: 0, right: 66, top: 52, bottom: 82 };
  const cymbalBRegion = { left: 232, right: 300, top: 59, bottom: 85 };

  const instrumentSet = [
    {
      id: 'drumA',
      region: drumARegion,
      inside: false,
      audioRef: drumAElemRef,
      audioSrc: drum_set1_drumA,
    },
    {
      id: 'drumB',
      region: drumBRegion,
      inside: false,
      audioRef: drumBElemRef,
      audioSrc: drum_set1_drumB,
    },
    {
      id: 'cymbalA',
      region: cymbalARegion,
      inside: false,
      audioRef: cymbalAElemRef,
      audioSrc: drum_set1_cymbalA,
    },
    {
      id: 'cymbalB',
      region: cymbalBRegion,
      inside: false,
      audioRef: cymbalBElemRef,
      audioSrc: drum_set1_cymbalB,
    },
  ];
  const [instrumentsRHState, setInstrumentsRHState] = useState(instrumentSet);
  const [instrumentsLHState, setInstrumentsLHState] = useState(instrumentSet);

  const isFirstTime = useRef(true);
  useEffect(() => {
    if (isFirstTime.current) {
      isFirstTime.current = false;
      populateCameraDropdown();
    }
  }, []);

  useEffect(() => {
    if (instrumentCanvasElemRef.current && showInstrumentRegions) {
      instrumentsRHState.forEach((instrument) => {
        drawInstrumentRect(instrument.region, instrument.inside, "rgb(255, 255, 0)", "rgb(255, 255, 255)");
      });
      instrumentsLHState.forEach((instrument) => {
        drawInstrumentRect(instrument.region, instrument.inside, "rgb(0, 0, 255)", "rgb(255, 255, 255)");
      });
    }
  }, [instrumentCanvasElemRef, showInstrumentRegions,
    instrumentsRHState, instrumentsLHState
  ]);
  
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

        if (option.text !== "") {
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
          setCameraFound(true);
        }
        else {
          alert("No camera found. Possible problem with site permissions. Enable camera in site permission.");
        }
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
      console.log("useEffect rightHandPt=" + rightX + "," + rightY);
      instrumentsRHState.forEach((instrument) => {
        playSoundIfInRegion(rightX, rightY, instrument, setInstrumentsRHState);
      });
    }
    if (leftHandPt) {
      let leftX = (1.0 - leftHandPt.x) * canvasElemRef.current.width;
      let leftY = leftHandPt.y * canvasElemRef.current.height;
      console.log("useEffect leftHandPt=" + leftX + "," + leftY);
      instrumentsLHState.forEach((instrument) => {
        playSoundIfInRegion(leftX, leftY, instrument, setInstrumentsLHState);
      });
    }
  }, [rightHandPt, leftHandPt, instrumentsRHState, instrumentsLHState]);

  function drawInstrumentRect(region, isInside, activeColor, inactiveColor) {
    const canvasCtx = instrumentCanvasElemRef.current.getContext("2d");
    canvasCtx.strokeStyle = (isInside) ? activeColor: inactiveColor;
    canvasCtx.lineWidth = 1;
    canvasCtx.beginPath();
    canvasCtx.rect(region.left, region.top, region.right - region.left, region.bottom - region.top);
    canvasCtx.stroke();
  }

  function playSoundIfInRegion(x, y, instrument, setInstrumentsState) {
    const { region, inside, audioRef } = instrument;
    if ((x > region.left) && (x < region.right) && (y > region.top) && (y < region.bottom)) {
      if (!inside) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setInstrumentsState((prevState) =>
          prevState.map((inst) =>
            inst.id === instrument.id ? { ...inst, inside: true } : inst
          )
        );
      }
    } else {
      // Introduce delay before resetting to reduce stuttering
      setTimeout(() => {
        if (inside) {
          setInstrumentsState((prevState) =>
            prevState.map((inst) =>
              inst.id === instrument.id ? { ...inst, inside: false } : inst
            )
          );
        }
      }, 50);
    }
  }

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

  const handleShowInstrumentRegionClick = async () => {
    if (showInstrumentRegions) {
      const canvasCtx = instrumentCanvasElemRef.current.getContext("2d");
      canvasCtx.clearRect(0, 0, canvasElemRef.current.width, canvasElemRef.current.height);
    }
    setShowInstrumentRegions(!showInstrumentRegions);
  };

  return (
    <div className="air-drummer-manager">
      {instrumentsRHState.map((instrumentsRH) => (
        <audio key={instrumentsRH.id} id={instrumentsRH.id} src={instrumentsRH.audioSrc} ref={instrumentsRH.audioRef}/>
      ))}
      <div id="video-button-group">
        <div className="camera-dropdown" onClick={handleCameraSelectedClick}>
          <select id="camera-select" defaultValue="">
            <option value="" disabled data-facing-mode="environment">Please select a camera</option>
          </select>
        </div>
        {!cameraFound && <button id="update-permission-button" onClick={handleSitePermissionClick}>Update Site Permission</button>}
        {cameraFound && <button id="flip-video-button" onClick={handleFlipVideoToggleClick}>Flip Video</button>}
        {cameraFound && <button id="show-hands-button" onClick={handleShowHandsClick}>
          {showHands ? "Hide Hands" : "Show Hands"}
        </button>}
        {cameraFound && <button id="show-instrument-regions-button" onClick={handleShowInstrumentRegionClick}>
          {showInstrumentRegions ? "Hide Regions" : "Show Regions"}
        </button>}
      </div>
      <div className="video-container">
        <video id="video-cam" autoPlay playsInline data-flipped="false" ref={videoElemRef}></video>
        <canvas id="hand-canvas" ref={canvasElemRef}></canvas>
        <img id="drum-set" src={drum_set1} alt="drum set"/>
        <canvas id="instrument-canvas" ref={instrumentCanvasElemRef} />
      </div>
    </div>
  );
};

export default AirDrummerManager;