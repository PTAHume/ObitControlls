# OrbitControls GLTF Viewer

A React TypeScript application built with Vite for testing and configuring Three.js OrbitControls parameters with GLTF/GLB models exported from Blender.

## Features

- **Drag & Drop Support**: Simply drag and drop your `.gltf` or `.glb` files onto the canvas
- **Real-time OrbitControls Configuration**: Adjust all OrbitControls parameters and see changes instantly
- **Visual Feedback**: Grid, lighting, and environment setup for better model visualization
- **Parameter Display**: View all current parameter values in JSON format
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ObitControlls
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Load a Model**: Drag and drop a `.gltf` or `.glb` file onto the canvas area
2. **Adjust Controls**: Use the control panel on the right to adjust OrbitControls parameters:
   - **Min/Max Distance**: Control zoom limits
   - **Min/Max Polar Angle**: Control vertical rotation limits (pitch)
   - **Min/Max Azimuth Angle**: Control horizontal rotation limits (yaw)
   - **Enable Damping**: Smooth camera movements
   - **Auto Rotate**: Enable automatic rotation with adjustable speed

3. **View Values**: The current parameter values are displayed at the bottom of the control panel in JSON format

## OrbitControls Parameters Explained

- **minDistance**: The minimum distance for zooming in (default: 1)
- **maxDistance**: The maximum distance for zooming out (default: 100)
- **minPolarAngle**: The minimum vertical angle in radians (0 = looking down)
- **maxPolarAngle**: The maximum vertical angle in radians (π = looking up)
- **minAzimuthAngle**: The minimum horizontal rotation angle
- **maxAzimuthAngle**: The maximum horizontal rotation angle
- **enableDamping**: Whether to enable inertia/smoothing
- **dampingFactor**: How much damping to apply (0.01-0.2)
- **autoRotate**: Whether to automatically rotate the camera
- **autoRotateSpeed**: Speed of automatic rotation

## Tips

- Polar angles are displayed in degrees for easier understanding
- Use the grid to gauge scale and distance
- The camera maintains its zoom level when adjusting angle constraints
- Copy the JSON values to use in your Three.js projects

## Technologies Used

- React 18
- TypeScript
- Vite
- Three.js
- React Three Fiber
- React Three Drei

## License

MIT
