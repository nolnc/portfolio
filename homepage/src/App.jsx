// App.jsx

import React, { useEffect } from 'react';
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
  let tileImagesLoaded = false;

  useEffect(() => {
    initPage();
  }, []);

  function initPage() {
    // Welcome screen click handler
    const welcomeTextBlock = document.getElementById("welcome-text-block");
    welcomeTextBlock.addEventListener("click", (e) => {
      transitionToMain(e.target);
    });
    welcomeTextBlock.addEventListener("animationend", (e) => {
      transitionToMain(e.target);
    });

    // Create tiles
    if (!tileImagesLoaded) {
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
      tileImagesLoaded = true;
    }
  };

  function transitionToMain(welcomeElem) {
    welcomeElem.style.animation = "none";
    welcomeElem.style.display = "none";
    const mainElem = document.getElementById("main-container");
    mainElem.style.display = "flex";
  }

  return (
    <div className="App">
      <div className="circular-gradient"></div>
      <div id="welcome-text-block" >
        <div id="top_text">Welcome</div>
        <div id="mid_text">to</div>
        <div id="bot_text">NC Lab</div>
      </div>
      <div id="main-container" style={{display: "none"}}>
        <div id="main-title">NC Lab Projects</div>
        <div id="tiles-container"></div>y
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
