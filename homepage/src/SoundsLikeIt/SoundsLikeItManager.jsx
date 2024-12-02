// SoundsLikeItManager.jsx

import React from 'react';
import { useContext } from 'react';
import { SoundsLikeItManagerCtx } from './SoundsLikeItManagerCtx';

const SoundsLikeItManager = () => {
  const {
    soundImages,
    soundSelectElemRef,
  } = useContext(SoundsLikeItManagerCtx);

  const getSoundImageSrc = (name) => {
    const image = soundImages.find((image) => image.name === name);
    return image ? image.src : null;
  };

  const handleSoundSelection = async (e) => {
    const selectedImageName = e.target.value;
    const selectedImage = soundImages.find((image) => image.name === selectedImageName);
    if (selectedImage) {
      document.getElementById("sound-img").src = selectedImage.src;
    }
  };

  return (
    <div className="sound-manager">
      <img id="sound-img" src={getSoundImageSrc("Dog")} alt="sound image"/>
      <div className="sound-dropdown" onClick={handleSoundSelection}>
        <select id="sound-select" ref={soundSelectElemRef} defaultValue="Dog">
        {soundImages.map((image, index) => (
          <option className="sound-item" key={index} value={image.name}>
            {image.name}
          </option>
        ))}
        </select>
      </div>
    </div>
  );
};

export default SoundsLikeItManager;