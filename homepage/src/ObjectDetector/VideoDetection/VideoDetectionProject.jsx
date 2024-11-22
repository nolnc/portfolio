import '../common/ObjectDetectorCommonStyles.css';
import './VideoDetectionStyles.css';
import React, { useEffect, useContext } from 'react';
import { ObjectDetectorProvider, ObjectDetectorAdapterCtx } from '../common/ObjectDetectorAdapterCtx';
import { VideoDetectionProvider, VideoDetectionCtx } from './VideoDetectionCtx';
//import ScoreThreshholdInput from '../common/ScoreThresholdInput';
//import { ScoreThresholdProvider } from '../common/ScoreThresholdContext';

function InnerVideoDetectionProject() {
  const { initializeObjectDetector } = useContext(ObjectDetectorAdapterCtx);
  const { enableCam } = useContext(VideoDetectionCtx);

  let firstTime = true;
  useEffect(() => {
    if (firstTime) {
      firstTime = false;
      console.log("ObjectDetectorProject useEffect() init");
      initializeObjectDetector();
    }
  }, []);

  const handleEnableCameraClick = async () => {
    enableCam();
  };

  return (
    <div className="VideoDetectionProject">
      <h1>Multiple object detection using the MediaPipe Object Detector task</h1>
      <div>This demo uses a model trained on the COCO dataset. It can identify 80 different classes of object in an image. <a href="https://github.com/amikelive/coco-labels/blob/master/coco-labels-2014_2017.txt" target="_blank" rel="noreferrer">See a list of available classes</a>
        <p>Also, check out the repository for this project: <a href="https://github.com/nolnc/obj-detection-react" target="_blank" rel="noreferrer">obj-detection-react</a>.</p></div>
      <div id="detector-container">
        <div id="video-mode">
          <h2>Continuous camera detection</h2>
          <p>Hold some objects up close to your camera to get a real-time detection!</p>
          <button className="enable-camera-button" onClick={handleEnableCameraClick}>Enable Camera</button>
          <div id="liveView" className="videoView">
            <video id="videoCam" autoPlay playsInline></video>
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