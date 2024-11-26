// MainScreen.jsx

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import background_img from './images/flowing_circuit_board.webp';
import image_detection_project_tile from './ObjectDetector/ImageDetection/project_tile.png';
import video_detection_project_tile from './ObjectDetector/VideoDetection/project_tile.png';
import audio_classifier_project_tile from './AudioClassifier/project_tile.png';

/*
import eggy_dragonball_fighter from './images/eggy_dragonball_fighter.png';
import Gochu from './images/Gochu.png';
import pika_cutie2 from './images/pika_cutie2.png';
import powerful_electric_pikachu from './images/powerful-electric-pikachu.webp';
import flowing_circuit_board from './images/flowing_circuit_board.webp';
import goku_family from './images/goku_family.jpg';
import pikachu_mail3 from './images/pikachu_mail3.png';
import background_prairie from './images/background_prairie.jpg';
import poke_boys2 from './images/poke_boys2.png';
import poke_pong from './images/poke_pong.png';
import Tobey_cannon from './images/Tobey_cannon.jpg';
import pokechoice from './images/pokechoice.jpg';
*/

function MainScreen() {

  const [isVisible, setIsVisible] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/main') {
      setIsVisible(true);
    }
  }, [location.pathname]);

  /*
  const images = [
    eggy_dragonball_fighter,
    Gochu,
    pika_cutie2,
    powerful_electric_pikachu,
    flowing_circuit_board,
    goku_family,
    pikachu_mail3,
    background_prairie,
    poke_boys2,
    poke_pong,
    Tobey_cannon,
    pokechoice,
  ];

  function addTile() {
    const tileGrid = document.getElementById("tiles-container");
    images.forEach((imageURL) => {
      const tile = document.createElement("div");
      tile.classList.add("tile");

      const img = document.createElement("img");
      img.src = imageURL;
      img.classList.add("tile-img");
      tile.appendChild(img);

      const name = document.createElement("div");
      name.innerText = "Project Name";
      name.classList.add("tile-name");
      tile.appendChild(name);

      tileGrid.appendChild(tile);
    });
  };

  function createSampleTiles() {
    const tileGrid = document.getElementById("tiles-container");
    images.forEach((imageURL) => {
      const tile = document.createElement("div");
      tile.classList.add("tile");

      const img = document.createElement("img");
      img.src = imageURL;
      img.classList.add("tile-img");
      tile.appendChild(img);

      const name = document.createElement("div");
      name.innerText = "Project Name";
      name.classList.add("tile-name");
      tile.appendChild(name);

      tileGrid.appendChild(tile);
    });
  };
  */

  function handleTileClick(e) {
    setIsVisible(false);
  }

  return (
    <div id="main-screen" style={{ display: isVisible ? 'block' : 'none' }}>
      <img className="main-background-img" src={background_img} alt="background"/>
      <div className="main-circular-gradient"></div>
      <div className="main-content">
        <div id="main-title">NC Lab Projects</div>
        <div id="tiles-container">
          <div className="tile" id="tile-image-detection" onClick={handleTileClick}>
            <Link to="/image-detection">
              <img className="tile-img" src={image_detection_project_tile} alt="video detection"/>
              <div className="tile-name">Image Object Detector</div>
            </Link>
          </div>
          <div className="tile" id="tile-video-detection" onClick={handleTileClick}>
            <Link to="/video-detection">
              <img className="tile-img" src={video_detection_project_tile} alt="video detection"/>
              <div className="tile-name">Video Object Detector</div>
            </Link>
          </div>
          <div className="tile" id="tile-audio-classifier" onClick={handleTileClick}>
            <Link to="/audio-classifier">
              <img className="tile-img" src={audio_classifier_project_tile} alt="audio classifier"/>
              <div className="tile-name">Audio Classifier</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainScreen;
