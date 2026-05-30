# NC Lab (nolnc.github.io)

Welcome to **NC Lab**, a personal portfolio and client-side AI playground showcasing interactive computer vision, audio classification, and hand-tracking applications. All demonstrations run entirely in the browser using React and Google's MediaPipe framework.

## 🚀 Live Site
Visit the live portal at: [nolnc.github.io](https://nolnc.github.io)

---

## 🛠️ Sandbox Projects

### 1. Air Drummer 🥁
Play drums in the air using your hands! Air Drummer captures your webcam feed, maps your hand joint coordinates, and triggers cymbal/drum sounds when your hands overlap the active hot-zones.

### 2. Hand Landmarker 🖐️
Tracks and visualizes 21 distinct joints per hand in real-time. Displays precise 2D/3D mapping points overlaying your live camera stream.

### 3. Sounds Like It 🎵
An interactive sound-mimicking game. Test your vocal mimicry skills by making sounds to match the prompts (e.g. animal calls, instruments) and see how well the microphone classifier rates you.

### 4. Audio Classifier 🎙️
Real-time audio detection that classifies sounds from your microphone (such as speech, whistling, snapping, or clapping) while drawing a live spectrogram.

### 5. Video Object Detector 🎥
Integrates with your webcam feed to perform real-time, low-latency object detection. Automatically overlays bounding boxes and classification tags onto recognized items.

### 6. Image Object Detector 🖼️
A static file drop-zone allowing you to drag and drop images to run client-side detection models and visualize identified elements instantly.

### 7. DriveTime APK 🚗
A card dedicated to downloading the latest built binaries of **DriveTime**—an Android dashcam application complete with accelerometer impact detection, location tracking, and audio/video recording controls.

---

## 📂 Project Directory Structure (Source)

- `src/`: The original React components, assets, contexts, and styles.
- `public/`: Public HTML templates and manifest assets.
- `package.json`: Dependency manifests and build/start scripts.

---

## ⚡ Setup & Development

This repository contains the source code for the NC Lab projects. 

### 1. Install Dependencies
Run this in the project root:
```bash
npm install
```

### 2. Run the Development Server
Start the interactive developer build environment:
```bash
npm run dev
```

### 3. Build for Production
To compile and optimize assets for deployment to the public site repo (`nolnc.github.io`):
```bash
npm run build
```
Copy the compiled assets from the `build/` folder into your `nolnc.github.io` directory.
