# Orbit Controls Helper

A React + TypeScript application for understanding and configuring Three.js OrbitControls-like behavior through model manipulation. This tool helps you find the perfect rotation and scale values by manipulating the model instead of the camera, making it easier to understand how orbit controls parameters work through trial and error.

## Features

- **Drag & Drop**: Simply drag and drop your 3D models to load them
  - Three.js Scene files (.json)
  - GLTF/GLB files (.gltf, .glb) - full compression support:
    - ✅ Draco geometry compression (10-20x smaller files)
    - ✅ KTX2/Basis texture compression (better GPU performance)
  - Wavefront OBJ files (.obj)
  - ZIP archives (.zip) - automatically extracts and loads the first 3D file found
- **Smart Auto-Framing**: Models are automatically centered and perfectly framed in view
  - Works with any model size (micro to massive)
  - Calculates optimal camera distance based on model dimensions
  - **Auto-resets rotation/scale** when loading new models for consistent starting position
  - No more hunting for invisible models!
- **Interactive Mouse Controls**: 
  - Drag to rotate the model (just like OrbitControls!)
  - Scroll to zoom in/out
  - Cursor changes to 'grab' when you can interact
- **Dual Control Methods**: Use mouse for natural interaction OR sliders for precise values
- **Real-time Value Updates**: Watch rotation and scale values update as you drag/scroll
- **Fixed Camera**: Camera stays in its original position while you manipulate the model (inverse of OrbitControls)
- **OrbitControls Mapping**: Visual guide showing how model controls map to OrbitControls parameters
- **Flexible Rotation Constraints**: 
  - Toggle rotation constraints on/off with checkboxes
  - Only enabled constraints are exported to JSON
  - Set min/max values for rotation angles to match OrbitControls limits
- **Multi-Camera Support**: Switch between cameras if your scene has multiple views
- **Settings Import/Export**: Save and share your model control configurations as JSON
- **Scene Management**: Reset controls to defaults or clear the scene entirely
- **Smooth Animations**: Optional damping for smooth transitions
- **Auto-Rotation**: Built-in turntable mode for showcasing models

## Architecture

This project follows modern React best practices with a clean, modular architecture:

- **📦 261 lines in App.tsx** (down from 783!) - just orchestration, no business logic
- **🎣 Custom Hooks** - Reusable logic for file loading, scene setup, and settings management
- **🔧 Services** - Pure functions for file loading and data transformation
- **🎨 Components** - Small, focused UI components (30-70 lines each)
- **📝 Full TypeScript** - Type-safe throughout

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## Getting Started

### Installation

```bash
npm install
npm run dev
```

The app will open at `http://localhost:5174/`

### Usage

1. **Load a Model**: Drag and drop any supported 3D file onto the canvas (.json, .gltf, .glb, .obj, or .zip)
   - The model is **automatically centered and framed** in the camera view
   - Works with models of any size - from tiny to massive
2. **Interact with Model**: 
   - **Drag** with mouse to rotate the model (pitch & yaw)
   - **Scroll** with mouse wheel to zoom in/out (scale)
   - **Or use sliders** for precise control
3. **Watch Values Update**: See rotation and scale values update in real-time as you interact
4. **Configure Constraints**: Enable constraint checkboxes and set min/max limits that mirror OrbitControls behavior
5. **Export Settings**: Copy the JSON configuration (only enabled constraints included) for use in your project
6. **Manage View**: 
   - **Reset View** - Return model to default rotation/scale (model auto-resets when loading new files)
   - **Reset Controls** - Restore all settings including constraints to defaults
   - **Clear Scene** - Remove the loaded model entirely

## Control Parameters

- **Rotation X**: Rotates the model up and down (pitch) in degrees
- **Rotation Y**: Rotates the model left and right (yaw) in degrees  
- **Scale**: Adjusts the size of the model (0.1 to 10x) - smaller = farther view, larger = closer view
- **Position Offset** (X, Y, Z): Manually adjust model position if it's off-center (-100 to +100 range)
- **Enable Damping**: Smooths out model movements
- **Damping Factor**: Controls smoothing amount (lower = smoother)
- **Auto Rotate**: Enables automatic turntable rotation
- **Auto Rotate Speed**: Controls rotation speed

## ZIP File Support

The app automatically extracts ZIP archives and loads the first 3D file it finds inside. This is useful when:
- Your models are compressed for storage/transfer
- You receive models in compressed archives
- You want to quickly test models without extracting them manually

Simply drag and drop the .zip file - no extraction needed! The app intelligently skips system files (like `__MACOSX`) and finds the actual 3D model.

## Troubleshooting

### File Not Loading?

If your file isn't loading:

1. **Check the browser console** (F12) - detailed error messages and file information are logged there
2. **Look at the file extension** - make sure it matches the actual file format:
   - Files ending in `.zip.glb` might actually be ZIP archives - try renaming to `.zip`
   - The app detects ZIP files by their content (magic bytes), not just extension
3. **Check file size** - extremely large files may take time to load
4. **Error messages** - Read the error message carefully - it will tell you:
   - If the file is actually a ZIP when named as GLB
   - If the file format is corrupted
   - Which file from a ZIP archive is being loaded

### Common Issues

- **"File appears to be a ZIP archive, not a GLB file"**: The file has `.glb` extension but contains ZIP data. Rename to `.zip` and try again.
- **GLB parsing errors**: The file may be corrupted or use an unsupported GLTF version
- **No camera view**: The app creates a default camera automatically - check if the model loaded but is outside the view

### Getting Help

If you're still having issues:
1. Check the browser console for detailed logs
2. Try loading the file in another 3D viewer to verify it's valid
3. Check if the file is actually in the format its extension suggests

## JSON Configuration

### Model Controls Format

You can import/export settings using the full model controls format:

```json
{
  "rotationX": 0,
  "rotationY": 0,
  "scale": 1,
  "positionX": 0,
  "positionY": 0,
  "positionZ": 0,
  "minRotationX": -3.14,
  "maxRotationX": 3.14,
  "minRotationY": -Infinity,
  "maxRotationY": Infinity,
  "enableDamping": true,
  "dampingFactor": 0.05,
  "autoRotate": false,
  "autoRotateSpeed": 2
}
```

### OrbitControls Format (Partial Import Supported!)

**You can also import just OrbitControls parameters** - specify only what you want to change:

```json
{
  "minPolarAngle": 1.1,
  "maxPolarAngle": 1.8,
  "enableDamping": true,
  "dampingFactor": 0.05
}
```

The app automatically maps OrbitControls properties to model controls:

| OrbitControls Property | Maps To | Notes |
|----------------------|---------|-------|
| `minPolarAngle` | `minRotationX` | Vertical rotation limit (pitch) |
| `maxPolarAngle` | `maxRotationX` | Vertical rotation limit (pitch) |
| `minAzimuthAngle` | `minRotationY` | Horizontal rotation limit (yaw) |
| `maxAzimuthAngle` | `maxRotationY` | Horizontal rotation limit (yaw) |
| `enableDamping` | `enableDamping` | Direct mapping |
| `dampingFactor` | `dampingFactor` | Direct mapping |
| `autoRotate` | `autoRotate` | Direct mapping |
| `autoRotateSpeed` | `autoRotateSpeed` | Direct mapping |

**Example**: Paste OrbitControls settings directly from your code and the app will apply them!

**Note**: OrbitControls' `minDistance`/`maxDistance` (camera zoom limits) are not supported as they don't map well to model scale. Use the Scale slider directly instead.

### Constraint Toggle Feature

Each rotation constraint group (Rotation X, Rotation Y) has an **enable/disable checkbox**. This allows you to:

- **Selective Constraints**: Enable only the constraints you need (e.g., only polar angle limits for vertical rotation)
- **Minimal JSON Export**: When you export settings, only enabled constraints are included in the JSON
- **Flexible Import**: When importing JSON, constraints are automatically enabled if values are provided
- **Clean Default State**: All constraints start disabled, so your initial export is minimal
- **Simple Scale Control**: No min/max scale constraints to keep things simple - just use the scale slider (0.1 to 10x)

**Truly Minimal Export:**
The export only includes values that differ from defaults. This means:
- `rotationX: 0`, `rotationY: 0` → omitted
- `scale: 1` → omitted
- `positionX: 0`, `positionY: 0`, `positionZ: 0` → omitted
- `enableDamping: false` → omitted (along with dampingFactor)
- `enableDamping: true` + `dampingFactor: 0.05` → only `enableDamping: true` exported (0.05 is default)
- `autoRotate: false` → omitted (along with autoRotateSpeed)
- `autoRotate: true` + `autoRotateSpeed: 2` → only `autoRotate: true` exported (2 is default)

**Example: Default state**
```json
{}
```
_All values are at defaults, so nothing is exported!_

**Example: With rotation applied**
```json
{
  "rotationX": -0.77,
  "rotationY": 0.09
}
```

**Example: With constraints and damping enabled (default damping factor)**
```json
{ 
  "rotationX": -0.77,
  "rotationY": 0.09,
  "minRotationX": 1.1, 
  "maxRotationX": 1.8,
  "enableDamping": true
}
```
_Note: dampingFactor (0.05) is at default, so it's omitted_

**Example: With custom damping factor**
```json
{ 
  "rotationX": -0.77,
  "enableDamping": true,
  "dampingFactor": 0.15
}
```
_Note: dampingFactor is included because it differs from default (0.05)_

The app will automatically enable constraints when you import values for them, leaving others unconstrained.

## Why This Tool?

Understanding OrbitControls parameters can be challenging through documentation alone. This tool helps you:

- **Learn by doing**: Visually understand how polar angles, azimuth angles, and distance constraints work
- **Find values faster**: Instead of guessing parameters and reloading your app, adjust them in real-time
- **Understand the inverse**: By manipulating the model instead of the camera, you gain insight into the relationship
- **Configure constraints**: Set up min/max limits that map directly to OrbitControls parameters
- **Export ready-to-use configs**: Get JSON settings you can apply directly to your projects

This approach is also ideal for applications where:
- The camera position is fixed in your application
- Users interact by rotating/scaling the model itself
- You need consistent camera views across different models
- You're building configurators or product viewers

Perfect for finding the right display angles and understanding OrbitControls through hands-on experimentation!

## Debugging

The project is configured for full TypeScript debugging support with source maps enabled.

### VS Code Debugging

Two debug configurations are available in `.vscode/launch.json`:

1. **Debug in Chrome** - Launch and debug in Google Chrome
2. **Debug in Edge** - Launch and debug in Microsoft Edge

**To debug:**
1. Start the dev server: `npm run dev`
2. Open the Debug panel in VS Code (Ctrl+Shift+D / Cmd+Shift+D)
3. Select "Debug in Chrome" or "Debug in Edge" from the dropdown
4. Press F5 or click the green play button
5. Set breakpoints in your TypeScript files by clicking the gutter
6. Step through code with F10 (step over), F11 (step into), Shift+F11 (step out)

### Browser DevTools Debugging

Source maps are enabled for both development and production builds, so you can:
1. Open browser DevTools (F12)
2. Navigate to the Sources tab
3. Find your TypeScript files in the file tree
4. Set breakpoints and debug directly in the original TypeScript code

### Features

- ✅ Full source map support for TypeScript
- ✅ Breakpoint debugging in original .tsx/.ts files
- ✅ Variable inspection and watch expressions
- ✅ Call stack navigation
- ✅ Console logging with proper source file references

## Development

Built with:
- React 19 + TypeScript
- Vite 6
- Three.js + React Three Fiber
- @react-three/drei for 3D helpers
- Material-UI (MUI) v5 for UI components
- Biome for formatting and linting

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run linter
npm run format   # Format code
npm run check    # Format + lint in one command
```

## License

MIT
