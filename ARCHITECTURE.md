# OrbitControls Helper - Architecture

## 📊 Refactoring Results

### Before vs After
- **App.tsx**: 783 lines → **261 lines** (67% reduction ✨)
- **Structure**: Monolithic → **Modular, maintainable architecture**

## 🏗️ Project Structure

```
src/
├── components/          # UI Components
│   ├── Controls/       # Control panel components
│   │   ├── AutoRotateControl.tsx
│   │   ├── CameraSelector.tsx
│   │   ├── DampingControl.tsx
│   │   ├── ModelInfo.tsx
│   │   ├── OrbitControlsMapping.tsx
│   │   ├── PositionControl.tsx
│   │   ├── RotationControl.tsx
│   │   ├── ScaleControl.tsx
│   │   └── index.ts
│   ├── Scene/          # 3D scene components
│   │   ├── Scene.tsx
│   │   ├── SceneModel.tsx
│   │   └── index.ts
│   └── Settings/       # Settings components
│       ├── CurrentSettingsDisplay.tsx
│       ├── SettingsImportExport.tsx
│       └── index.ts
├── hooks/              # Custom React Hooks
│   ├── useFileLoader.ts
│   ├── useSceneSetup.ts
│   ├── useSettingsManager.ts
│   └── index.ts
├── services/           # Business Logic
│   ├── loaders/       # File loading services
│   │   ├── fileLoader.ts
│   │   ├── gltfLoader.ts
│   │   ├── objLoader.ts
│   │   ├── sceneLoader.ts
│   │   ├── zipLoader.ts
│   │   └── index.ts
│   ├── sceneSetup.ts
│   └── settingsUtils.ts
├── theme/              # Theme Configuration
│   └── theme.ts
├── types/              # TypeScript Types
│   └── index.ts
├── utils/              # Utility Functions
│   └── helpers.ts
├── App.tsx             # Main App (orchestration only)
├── App.css
└── main.tsx
```

## 📁 Component Organization

### 1. **App.tsx** (261 lines)
**Purpose**: Orchestration layer only
- State declarations
- Hook invocations
- Event handler delegation
- UI rendering

**Responsibilities**:
- ✅ Coordinate between hooks
- ✅ Handle user events
- ✅ Render UI components
- ❌ No business logic
- ❌ No file loading
- ❌ No scene setup

### 2. **Custom Hooks** (`src/hooks/`)

#### **`useFileLoader.ts`**
```typescript
export const useFileLoader = () => {
  // Handles all file loading operations
  // Returns: { loadFile, isLoading, error, clearError }
}
```
- Loads 3D files (JSON, GLTF, GLB, OBJ, ZIP)
- Manages loading state
- Error handling

#### **`useSceneSetup.ts`**
```typescript
export const useSceneSetup = () => {
  // Handles scene and camera setup
  // Returns: { sceneData, setupScene, clearScene, changeCamera }
}
```
- Scene initialization
- Camera positioning
- Scene management

#### **`useSettingsManager.ts`**
```typescript
export const useSettingsManager = () => {
  // Manages all model control settings
  // Returns: { settings, updateSetting, applyJsonSettings, ... }
}
```
- Settings state management
- JSON import/export
- Settings validation

### 3. **Services** (`src/services/`)

#### **Loaders** (`src/services/loaders/`)
Pure functions for loading different file formats:
- `fileLoader.ts` - Main file loading coordinator
- `gltfLoader.ts` - GLTF/GLB loading with Draco/KTX2 support
- `objLoader.ts` - OBJ file loading
- `sceneLoader.ts` - Three.js JSON scene loading
- `zipLoader.ts` - ZIP archive extraction

#### **Scene Setup** (`src/services/sceneSetup.ts`)
```typescript
export const setupSceneWithCamera = (loadedScene: Object3D): SceneData
```
- Camera detection and positioning
- Bounding box calculations
- Auto-framing logic

#### **Settings Utilities** (`src/services/settingsUtils.ts`)
```typescript
export const applyOrbitControlsMapping = (parsed: object): Partial<Settings>
export const buildMinimalExportSettings = (settings: Settings): object
```
- OrbitControls property mapping
- Minimal JSON export generation

### 4. **Components** (`src/components/`)

All UI components follow single-responsibility principle:
- Small, focused components (30-70 lines each)
- Reusable across the application
- No business logic (just presentation)
- Props-driven (easy to test)

### 5. **Theme** (`src/theme/`)
```typescript
export const darkTheme = createTheme({ ... })
```
- Centralized MUI theme configuration
- Dark mode styling
- Consistent design system

### 6. **Types** (`src/types/`)
```typescript
export interface ModelControlsSettings { ... }
export interface SceneData { ... }
export interface CurrentValues { ... }
```
- Shared TypeScript interfaces
- Type safety across the app

### 7. **Utilities** (`src/utils/`)
```typescript
export const roundNumber = (value: number): number
```
- Helper functions
- Utility methods

## 🎯 Benefits of This Architecture

### 1. **Maintainability** ✅
- Each file has a single, clear purpose
- Easy to locate and fix bugs
- Changes are isolated to specific modules

### 2. **Testability** ✅
- Hooks can be tested independently
- Services are pure functions (easy to unit test)
- Components can be tested in isolation

### 3. **Reusability** ✅
- Hooks can be reused in other components
- Services can be used in different contexts
- Components are self-contained

### 4. **Scalability** ✅
- Easy to add new file formats (add a loader)
- Easy to add new controls (add a component)
- Easy to extend functionality (add a hook)

### 5. **Developer Experience** ✅
- Clear separation of concerns
- Intuitive folder structure
- Easy to onboard new developers
- Industry best practices

## 🔄 Data Flow

```
User Action
    ↓
App.tsx (Event Handler)
    ↓
Custom Hook (Business Logic)
    ↓
Service (Pure Function)
    ↓
State Update
    ↓
Component Re-render
```

## 🚀 Adding New Features

### To add a new file format:
1. Create loader in `src/services/loaders/`
2. Update `fileLoader.ts` to handle new extension
3. Export from `src/services/loaders/index.ts`
4. Done! ✨

### To add a new control:
1. Create component in `src/components/Controls/`
2. Add to `src/components/Controls/index.ts`
3. Use in `App.tsx`
4. Done! ✨

### To add new settings:
1. Update `ModelControlsSettings` interface in `src/types/`
2. Update `useSettingsManager` hook
3. Update `buildMinimalExportSettings` if needed
4. Done! ✨

## 📝 Code Quality

### Standards:
- ✅ TypeScript for type safety
- ✅ Biome for linting and formatting
- ✅ MUI for consistent UI
- ✅ React hooks patterns
- ✅ Functional programming principles
- ✅ Single responsibility principle
- ✅ DRY (Don't Repeat Yourself)

### Best Practices:
- Components: 30-70 lines (small and focused)
- Hooks: Single responsibility
- Services: Pure functions (no side effects)
- Types: Shared interfaces for consistency
- Exports: Named exports with barrel files (index.ts)

## 🎓 Learning Resources

This architecture follows React best practices:
- [React Hooks](https://react.dev/reference/react)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 🤝 Contributing

When contributing:
1. Keep components small (30-70 lines)
2. Extract business logic to hooks/services
3. Use TypeScript types
4. Follow existing patterns
5. Run `npm run build` before committing
6. Run `npm run format` to format code

## 📊 Metrics

- **Total Files**: ~30 (well-organized)
- **Average Component Size**: 50 lines
- **App.tsx Size**: 261 lines (down from 783)
- **Build Time**: ~8 seconds
- **Type Safety**: 100% (TypeScript)
- **Linter Errors**: 0 ✅

