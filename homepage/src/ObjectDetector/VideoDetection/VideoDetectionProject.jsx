// VideoDetectionProject.jsx

import '../common/ObjectDetectorCommonStyles.css';
import './VideoDetectionStyles.css';
import React, { useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ObjectDetectorProvider, ObjectDetectorAdapterCtx } from '../common/ObjectDetectorAdapterCtx';
import { VideoDetectionProvider, VideoDetectionCtx } from './VideoDetectionCtx';
//import ScoreThreshholdInput from '../common/ScoreThresholdInput';
//import { ScoreThresholdProvider } from '../common/ScoreThresholdContext';

function InnerVideoDetectionProject() {
  const { initializeObjectDetector } = useContext(ObjectDetectorAdapterCtx);
  const { enableCam, disableCam, populateCameraDropdown } = useContext(VideoDetectionCtx);

  const isFirstTime = useRef(true);
  useEffect(() => {
    if (isFirstTime.current) {
      isFirstTime.current = false;
      initializeObjectDetector();
      populateCameraDropdown();
    }
  }, []);

  const location = useLocation();
  useEffect(() => {
    return () => {
      if (location.pathname === '/video-detection') {
        disableCam();
      }
    };
  }, [location.pathname]);

  const handleCameraSelectedClick = async () => {
    const cameraSelect = document.getElementById('camera-select');
    const selectedCameraId = cameraSelect.value;
    console.log("selectedCameraId=" + selectedCameraId);
    if (selectedCameraId !== "") {
      enableCam();
    }
  };

  return (
    <div className="VideoDetectionProject">
      <h1>Video Object Detection</h1>
      <p>This demo uses the MediaPipe Object Detector task and a model trained on the COCO dataset.</p>
      <p>It can identify 80 different classes of object in an image. <a href="https://github.com/amikelive/coco-labels/blob/master/coco-labels-2014_2017.txt" target="_blank" rel="noreferrer">See a list of available classes</a></p>
      <p>Also, check out the repository for this project: <a href="https://github.com/nolnc/portfolio/tree/main/homepage/src/ObjectDetector" target="_blank" rel="noreferrer">Object Detector source</a>.</p>
      <div id="detector-container">
        <div id="video-mode">
          <h2>Continuous camera detection</h2>
          <p>Hold some objects up close to your camera to get a real-time detection!</p>
          <div className="camera-dropdown" onClick={handleCameraSelectedClick}>
            <select id="camera-select">
              <option value="" data-facing-mode="environment">Please select a camera</option>
            </select>
          </div>
          <div id="liveView" className="videoView">
            <video id="videoCam" autoPlay playsInline data-flipped="false"></video>
          </div>
        </div>
      </div>
    </div>
  );
}

// Context provider wrapper for VideoDetectionProject 
function VideoDetectionProject() {
  return (
    <ObjectDetectorProvider>
      <VideoDetectionProvider>
        <InnerVideoDetectionProject />
      </VideoDetectionProvider>
    </ObjectDetectorProvider>
  );
}

export default VideoDetectionProject;