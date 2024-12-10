// App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import WelcomeScreen from './WelcomeScreen';
import MainScreen from './MainScreen';
import ImageDetectionProject from './ObjectDetector/ImageDetection/ImageDetectionProject';
import VideoDetectionProject from './ObjectDetector/VideoDetection/VideoDetectionProject';
import AudioClassifierProject from './AudioClassifier/AudioClassifierProject';
import SoundsLikeItProject from './SoundsLikeIt/SoundsLikeItProject';
import HandLandmarkerProject from './HandLandmarker/HandLandmarkerProject';
import AirDrummerProject from './AirDrummer/AirDrummerProject';

function InnerApp() {

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<WelcomeScreen/>} />
        <Route path="/main" element={<MainScreen/>} />
        <Route path="/image-detection" element={<ImageDetectionProject/>} />
        <Route path="/video-detection" element={<VideoDetectionProject/>} />
        <Route path="/audio-classifier" element={<AudioClassifierProject/>} />
        <Route path="/sounds-like-it" element={<SoundsLikeItProject/>} />
        <Route path="/hand-landmarker" element={<HandLandmarkerProject/>} />
        <Route path="/air-drummer" element={<AirDrummerProject/>} />
      </Routes>
    </div>
  );
}

// Context provider wrapper for App 
function App() {
  return (
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  );
}

export default App;
