# Changelog

## [Unreleased] - 2025-11-18

### Added
- **Multiple 3D File Format Support**: 
  - Three.js Scene files (.json)
  - GLTF/GLB files (.gltf, .glb) - industry standard
  - Wavefront OBJ files (.obj)
  - ZIP archives (.zip) - automatically extracts and loads 3D files
  - Smart camera positioning based on model bounding box with edge case handling
  - Skips macOS system files (__MACOSX) in ZIP archives
- **OrbitControls JSON Import**: 
  - Paste OrbitControls settings directly from your code
  - Partial import supported - specify only the parameters you want to change
  - Automatic mapping: minDistance/maxDistance, minPolarAngle/maxPolarAngle, etc.
  - No need to convert formats manually!
- **Constraint Toggle Checkboxes**:
  - Enable/disable constraints for Rotation X, Rotation Y, and Scale independently
  - Minimal JSON export - only enabled constraints are included
  - Automatically enables constraints when importing JSON with those values
  - Perfect for applying only specific limits (e.g., only polar angle constraints)
  - Constraints start disabled by default for maximum flexibility
- **Smart Auto-Framing**:
  - Models are automatically centered and perfectly framed when loaded
  - **Auto-resets view** (rotation/scale) when loading a new model
  - Calculates optimal camera distance accounting for both vertical and horizontal FOV
  - Handles edge cases: very small, very large, and invalid bounding boxes
  - Adds 2x padding to ensure entire model is comfortably visible
  - Positions camera at an angle for better 3D perception
- **Position Offset Controls**:
  - Manual X, Y, Z position adjustments for off-center models
  - Range of -10 to +10 for each axis
  - Perfect for models with non-centered pivot points or unusual geometry
  - Automatically included in JSON export if non-zero
  - Resets to 0,0,0 when loading new models or using "Reset View"
- **Reset View Button**:
  - Quickly reset rotation, scale, and position to defaults without clearing the model
  - Useful when model gets rotated/scaled/positioned into an awkward location
  - Separate from "Reset Controls" which resets all settings including constraints
- **Clear Scene Button**:
  - Remove loaded model with one click
  - Button is disabled when no scene is loaded
  - Provides user feedback when scene is cleared
- **Interactive Mouse Controls**: 
  - Drag with mouse to rotate the model (pitch and yaw)
  - Scroll with mouse wheel to zoom in/out (scale)
  - Cursor feedback (grab/grabbing) during interaction
  - Real-time updates to sliders and values as you interact
  - Visual hint showing available interactions
- **Dual Control Methods**: Users can now either drag the model directly OR use sliders for precise control
- Auto-rotation disables mouse controls to prevent conflicts
- **Biome Integration**: Migrated from ESLint to Biome for faster, all-in-one tooling
  - ~35x faster than Prettier for formatting
  - Combined linting and formatting in single tool
  - New `npm run format` and `npm run check` commands

### Updated
- **All npm packages updated to latest versions:**
  - `@react-three/drei`: 10.0.8 → 10.7.7
  - `@react-three/fiber`: 9.1.2 → 9.4.0
  - `@types/three`: 0.176.0 → 0.181.0
  - `three`: 0.176.0 → 0.181.1
  - `react`: 19.1.0 → 19.2.0
  - `react-dom`: 19.1.0 → 19.2.0
- **Added JSZip**: For automatic ZIP archive extraction and processing

### Fixed
- **Full GLTF/GLB Compression Support**: Added Draco and KTX2 loader support
  - **Draco compression**: Handles compressed geometry (reduces file size by 10-20x)
  - **KTX2 textures**: Handles compressed textures for better performance
  - Automatically detects and uses appropriate decoders
  - Uses official decoders from Google (Draco) and Three.js (Basis/KTX2)
  - Proper cleanup with `dispose()` after loading to free resources
  - Eliminates "No DRACOLoader instance provided" and "setKTX2Loader must be called" errors
- **WebGL Context Crash**: Removed Environment component that was causing 404 errors and WebGL context loss
  - HDR file was failing to load from CDN
  - Now uses simple ambient + directional lighting for better reliability
- **Truly Minimal JSON Export**: Only exports non-default values
  - Default values (rotationX: 0, rotationY: 0, scale: 1) are omitted
  - False boolean flags (enableDamping: false, autoRotate: false) are omitted
  - Related settings omitted when parent is disabled (e.g., no dampingFactor if enableDamping is false)
  - Default state exports as `{}` - perfectly clean!
  - Helpful message shown when everything is at defaults
  - Prevents copying empty/default configurations
- **Numeric Precision**: All numeric values rounded to 4 decimal places
  - Eliminates floating-point precision artifacts (e.g., `-0.7699999999999992` → `-0.77`)
  - Special handling for Infinity values (preserved as-is)
- **Display Matches Export**: Settings display shows exactly what will be copied/exported
  - Constraint values hidden when constraints are disabled
  - Much cleaner UI with only relevant values shown
- **Type Safety**: Replaced `any` type with proper `Group` type for `modelGroupRef`
- **Camera Synchronization**: Improved camera property copying to include `near`, `far`, and `zoom` properties
- **Infinity Constraints**: Better handling of Infinity values in rotation Y constraints
- **Code Quality**: Improved type checking and null safety in `useFrame` callback
- **Blank Scene Issues**: 
  - Handles invalid bounding boxes (empty, zero-size, infinite dimensions)
  - Automatically adjusts camera for very small models (< 0.001 units)
  - Automatically adjusts camera for very large models (> 1000 units)
  - Logs detailed camera positioning info to console for debugging
  - Dynamic near/far plane calculation based on model size

### Improved
- **Project naming**: Renamed from "obitcontrolls" to "orbit-controls-helper" for clarity
- **README**: Enhanced documentation to better explain the tool's purpose and how it helps understand OrbitControls
- **HTML Title**: Updated page title to match project name
- **Developer Experience**: Removed 111 ESLint-related packages, added just 1 Biome package
- **Build Speed**: Linting and formatting is now significantly faster

### Code Quality Improvements (Biome Migration)
- Removed non-null assertions for safer null handling
- Fixed potential null reference errors
- Added explicit button types for better accessibility
- Replaced `any` types with proper type definitions (`unknown`, `Error`)
- Applied optional chaining for cleaner null checks
- Used template literals instead of string concatenation
- Fixed React type imports
- Used UUID instead of array index for React keys

### Code Changes
- Extracted group reference null check at the start of `useFrame` for cleaner code
- Improved constraint handling with explicit Infinity checks
- Enhanced camera setup logic in useEffect hook
- Better error handling with proper type narrowing

## Summary
This major update brings:
- **All dependencies** updated to their latest versions
- **Interactive mouse controls** for natural model manipulation
- **Biome toolchain** replacing ESLint/Prettier for ~35x faster linting and formatting
- **Enhanced type safety** with no `any` types and proper null handling
- **Better code quality** through automated fixes and best practices
- **Improved accessibility** with explicit button types
- **Clearer documentation** explaining the tool's purpose and usage

The application now builds cleanly with no errors/warnings, passes all Biome checks, and provides a significantly better developer experience.

