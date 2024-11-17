/* script.js */

// Welcome screen click handler
const welcomeTextBlock = document.getElementById("welcome-text-block");
welcomeTextBlock.addEventListener("click", (e) => {
  transitionToMain(e.target);
});
welcomeTextBlock.addEventListener("animationend", (e) => {
  transitionToMain(e.target);
});

function transitionToMain(welcomeElem) {
  welcomeElem.style.animation = "none";
  welcomeElem.style.display = "none";
  const mainElem = document.getElementById("main-container");
  mainElem.style.display = "flex";
}


const images = [
    "images/eggy_dragonball_fighter.png",
    "images/Gochu.png",
    "images/pika_cutie2.png",
    "images/powerful-electric-pikachu.webp",
    "images/flowing_circuit_board.webp",
    "images/goku_family.jpg",
    "images/pikachu_mail3.png",
    "images/background_prairie.jpg",
    "images/poke_boys2.png",
    "images/poke pong.png",
    "images/Tobey_cannon.jpg",
    "images/pokechoice.jpg",
];

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