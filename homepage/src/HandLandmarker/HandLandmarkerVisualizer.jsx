// HandLandmarkerVisualizer.jsx

import React, { useEffect, useRef } from 'react';

const HandLandmarkerVisualizer = ({ results, landmarkOptions, lineOptions }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { landmarks } = results;

    // Draw landmarks
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const landmark of landmarks) {
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;
      const z = landmark.z;
      console.log("x=" + x + " y=" + y + " z=" + z);
      ctx.beginPath();
      ctx.arc(x, y, landmarkOptions.size, 0, 2 * Math.PI);
      ctx.fillStyle = landmarkOptions.color;
      ctx.fill();
    }

    // Draw lines
    const connections = [
      [0, 1, 5, 17],
      [1, 2],
      [2, 3],
      [3, 4],
      [5, 6, 9],
      [6, 7],
      [7, 8],
      [9, 10, 13],
      [10, 11],
      [11, 12],
      [13, 14, 17],
      [14, 15],
      [15, 16],
      [17, 18],
      [18, 19],
      [19, 20],
    ];

    ctx.strokeStyle = lineOptions.color;
    ctx.lineWidth = lineOptions.width;

    for (const connection of connections) {
      for (let i = 0; i < connection.length - 1; i++) {
        const from = landmarks[connection[i]];
        const to = landmarks[connection[i + 1]];
        const x1 = from.x * canvas.width;
        const y1 = from.y * canvas.height;
        const x2 = to.x * canvas.width;
        const y2 = to.y * canvas.height;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  }, [results, landmarkOptions, lineOptions]);
};

export default HandLandmarkerVisualizer;