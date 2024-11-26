import '../common/ObjectDetectorCommonStyles.css';
import './ImageDetectionStyles.css';
import React, { useEffect, useContext, useRef } from 'react';
import { ObjectDetectorProvider, ObjectDetectorAdapterCtx } from '../common/ObjectDetectorAdapterCtx';
import { ImageDetectionProvider } from './ImageDetectionCtx';
import ImageDropZone from './ImageDropZone';
import { ScoreThresholdProvider } from '../common/ScoreThresholdContext';

function InnerImageDetectionProject() {
  const { initializeObjectDetector } = useContext(ObjectDetectorAdapterCtx);

  const isFirstTime = useRef(true);
  useEffect(() => {
    if (isFirstTime.current) {
      isFirstTime.current = false;
      initializeObjectDetector();
    }
  }, []);

  return (
    <div className="ImageDetectionProject">
      <h1>Multiple object detection using the MediaPipe Object Detector task</h1>
      <div>This demo uses a model trained on the COCO dataset. It can identify 80 different classes of object in an image. <a href="https://github.com/amikelive/coco-labels/blob/master/coco-labels-2014_2017.txt" target="_blank" rel="noreferrer">See a list of available classes</a>
        <p>The source for this project can be found in: <a href="https://github.com/nolnc/portfolio/tree/main/homepage/src/ObjectDetector" target="_blank" rel="noreferrer">Object Detector source</a>.</p></div>
      <div id="detector-container">
        <div id="image-mode">
          <h2>Detecting Images</h2>
          <p><b>Upload</b> an image below to detect objects in the image.</p>
          <div id="staticImageView" className="imageView">
            <ImageDropZone/>
          </div>
        </div>
      </div>
    </div>
  );
}

// Context provider wrapper for ImageDetectionProject 
function ImageDetectionProject() {
  return (
    <ObjectDetectorProvider>
      <ScoreThresholdProvider>
        <ImageDetectionProvider>
          <InnerImageDetectionProject />
        </ImageDetectionProvider>
      </ScoreThresholdProvider>
    </ObjectDetectorProvider>
  );
}

export default ImageDetectionProject;