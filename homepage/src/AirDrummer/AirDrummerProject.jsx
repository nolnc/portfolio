// AirDrummerProject.jsx

import './AirDrummerStyles.css';
import React, { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { HandLandmarkerAdapterProvider } from '../HandLandmarker/HandLandmarkerAdapterCtx';
import { AirDrummerManagerProvider, AirDrummerManagerCtx } from './AirDrummerManagerCtx';
import AirDrummerManager from './AirDrummerManager';

function InnerAirDrummerProject() {
  const { disableCam } = useContext(AirDrummerManagerCtx);

  // Disable camera when leaving page
  const location = useLocation();
  useEffect(() => {
    return () => {
      if (location.pathname === '/air-drummer') {
        disableCam();
      }
    };
  }, [location.pathname]);

  return (
    <div className="AirDrummerProject">
      <div id="detector-container">
        <div className="project-title">Air Drummer</div>
        <p>Drum the air with your hands like a crazy person!</p>
        <div id="output-container">
          <AirDrummerManager/>
        </div>
      </div>
    </div>
  );
}

// Context provider wrapper for AirDrummerProject 
function AirDrummerProject() {
  return (
    <HandLandmarkerAdapterProvider>
      <AirDrummerManagerProvider>
          <InnerAirDrummerProject />
      </AirDrummerManagerProvider>
    </HandLandmarkerAdapterProvider>
  );
}

export default AirDrummerProject;