// App.jsx

import React, { useEffect } from 'react';

import ImageDetectionProject from './ObjectDetector/ImageDetection/ImageDetectionProject';
import image_detection_project_tile from './ObjectDetector/ImageDetection/project_tile.png';
import VideoDetectionProject from './ObjectDetector/VideoDetection/VideoDetectionProject';
import video_detection_project_tile from './ObjectDetector/VideoDetection/project_tile.png';

import background_img from './images/flowing_circuit_board.webp';

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

function InnerApp() {

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

  function handleWelcomeClick() {
    transitionToMain();
  }

  function handleAnimationEnd() {
    transitionToMain();
  }

  function transitionToMain() {
    const welcomeElem = document.getElementById("welcome-container");
    welcomeElem.style.animation = "none";
    welcomeElem.style.display = "none";
    const mainElem = document.getElementById("main-container");
    mainElem.style.display = "block";
  };

  function handleTileClick(e) {
    console.log("handleTileClick() e.target: id=" + e.target.id + " className=" + e.target.className);
    
    const mainElem = document.getElementById("main-container");
    mainElem.style.display = "none";

    const projectId = e.target.parentElement.getAttribute("id");
    const projectName = projectId.substring(5);

    const project = document.getElementById("project-" + projectName);
    project.style.display = "block";
  }

  return (
    <div className="App">
      <div id="welcome-container" onClick={handleWelcomeClick} onAnimationEnd={handleAnimationEnd}>
        <img className="background-img" src={background_img}/>
        <div className="circular-gradient"></div>
        <div className="welcome-text">
          <div id="top_text">Welcome</div>
          <div id="mid_text">to</div>
          <div id="bot_text">NC Lab</div>
          <div className="welcome-progress-bar">
            <div className="welcome-progress" id="welcome-progress"></div>
          </div>
        </div>
      </div>
      
      <div id="main-container" style={{display: "none"}}>
        <img className="main-background-img" src={background_img}/>
        <div className="main-circular-gradient"></div>
        <div className="main-content">
          <div id="main-title">NC Lab Projects</div>
          <div id="tiles-container">
            <div className="tile" id="tile-image-detection" onClick={handleTileClick}>
              <img className="tile-img" src={image_detection_project_tile}/>
              <div className="tile-name">Image Object Detector</div>
            </div>
            <div className="tile" id="tile-video-detection" onClick={handleTileClick}>
              <img className="tile-img" src={video_detection_project_tile}/>
              <div className="tile-name">Video Object Detector</div>
            </div>
          </div>
        </div>
      </div>
      <div className="project-container" id="project-image-detection" style={{display: "none"}}>
        <ImageDetectionProject/>
      </div>
      <div className="project-container" id="project-video-detection" style={{display: "none"}}>
        <VideoDetectionProject/>
      </div>
      
    </div>
  );
}

// Context provider wrapper for App 
function App() {
  return (
    <InnerApp />
  );
}

export default App;
