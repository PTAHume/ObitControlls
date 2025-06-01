# Model Controls Tester

A React + TypeScript application for testing Three.js model transformations with scene.json files. This tool helps you find the perfect rotation and scale values for your 3D models, similar to the approach used in kit-builder-api where the camera stays fixed and the model is manipulated.

## Features

- **Drag & Drop**: Simply drag and drop your Three.js scene.json files to load them
- **Model Transformation Controls**: Adjust rotation (X/Y) and scale in real-time
- **Fixed Camera**: Camera stays in its original position while you manipulate the model
- **Multi-Camera Support**: Switch between cameras if your scene has multiple views
- **Real-time Preview**: See changes instantly as you adjust values
- **Settings Import/Export**: Save and share your model control configurations as JSON
- **Smooth Animations**: Optional damping for smooth transitions
- **Auto-Rotation**: Built-in turntable mode for showcasing models

## Getting Started

### Installation

```bash
npm install
npm run dev
```

The app will open at `http://localhost:5174/`

### Usage

1. **Load a Scene**: Drag and drop a Three.js scene.json file onto the canvas
2. **Adjust Model**: Use the sliders to rotate and scale your model
3. **Export Settings**: Copy the JSON configuration for use in your project

## Control Parameters

- **Rotation X**: Rotates the model up and down (pitch) in degrees
- **Rotation Y**: Rotates the model left and right (yaw) in degrees  
- **Scale**: Adjusts the size of the model (0.1 to 5x)
- **Enable Damping**: Smooths out model movements
- **Damping Factor**: Controls smoothing amount (lower = smoother)
- **Auto Rotate**: Enables automatic turntable rotation
- **Auto Rotate Speed**: Controls rotation speed

## JSON Configuration

You can import/export settings in this format:

```json
{
  "rotationX": 0,
  "rotationY": 0,
  "scale": 1,
  "enableDamping": true,
  "dampingFactor": 0.05,
  "autoRotate": false,
  "autoRotateSpeed": 2
}
```

## Why Model Controls?

This approach matches workflows where:
- The camera position is fixed in your application
- Users interact by rotating/scaling the model itself
- You need consistent camera views across different models
- You're building configurators or product viewers

Perfect for finding the right display angles without trial and error!

## Development

Built with:
- React + TypeScript
- Vite
- Three.js + React Three Fiber
- @react-three/drei for helpers

## License

MIT
