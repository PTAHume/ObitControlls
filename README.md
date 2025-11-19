# Orbit Controls Helper

A tool for understanding Three.js OrbitControls by manipulating a 3D model directly. Helps you find the right rotation and constraint values through visual experimentation.

## Features

- Drag & drop support for .json, .gltf, .glb, .obj, and .zip files
- Interactive mouse controls (drag to rotate, scroll to zoom)
- Dual control methods: mouse or sliders
- Real-time value updates
- Constraint toggles for rotation limits
- JSON import/export for settings
- Multi-camera support
- Auto-framing on load

## Installation

```bash
npm install
npm run dev
```

## Usage

1. Drag and drop a 3D model onto the canvas
2. Use mouse or sliders to manipulate the model
3. Toggle constraints to set rotation limits
4. Export settings as JSON when you find the right values

## Controls

- **Mouse drag**: Rotate model
- **Mouse scroll**: Scale model
- **Sliders**: Precise adjustments
- **Reset View**: Return to default position
- **Reset Controls**: Clear all settings
- **Clear Scene**: Remove loaded model

## JSON Export

The app exports minimal JSON with only non-default values:

```json
{
  "minRotationX": -1.5708,
  "maxRotationX": 1.5708,
  "autoRotate": true
}
```

Enable constraints using the checkboxes to include them in the export.

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run format       # Format code with Biome
npm run check        # Run linter
```

## Tech Stack

- React + TypeScript
- Three.js + React Three Fiber
- Material-UI
- Vite
- Biome

## Troubleshooting

If models don't load:
- Check file format is supported
- Ensure file isn't corrupted
- Check browser console for errors
- Try a different model

## License

MIT
