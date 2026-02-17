# Electron API TypeError Fix

## Problem

Error encountered:
```
TypeError: Cannot read properties of undefined (reading 'checkGPhoto2WSL')
```

This error occurred when the renderer process tried to access `window.electronAPI.checkGPhoto2WSL()` before the preload script had finished loading or in environments where it failed to load properly.

## Root Cause

The issue can happen in several scenarios:

1. **Timing Issue**: The renderer code executes before the preload script completes
2. **Path Resolution**: The preload script path is incorrect in some environments
3. **Build/CI Environments**: Electron may not be fully initialized in automated build systems
4. **Context Isolation**: Issues with contextBridge not properly exposing the API

## Solution Implemented

### 1. Renderer Process - Defensive Checks (src/App.tsx)

Added availability checks before accessing electronAPI methods:

```typescript
const checkGPhoto2Availability = async () => {
  try {
    // Check if electronAPI is available (preload script loaded)
    if (!window.electronAPI || !window.electronAPI.checkGPhoto2WSL) {
      console.warn('electronAPI not available - preload script may not have loaded')
      setStatusMessage('Electron API 未加载')
      return
    }
    
    const result = await window.electronAPI.checkGPhoto2WSL()
    // ... rest of the logic
  } catch (error) {
    console.error('检查 gphoto2 失败:', error)
    setStatusMessage('检查 gphoto2 失败')
  }
}
```

Similar checks added to:
- `connectCamera()` function
- `capturePhoto()` function
- Any other function that accesses `window.electronAPI`

### 2. Main Process - Enhanced Logging (electron/main.ts)

Added diagnostic logging to help identify path issues:

```typescript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log paths for debugging
console.log('Main process __dirname:', __dirname);
console.log('Main process __filename:', __filename);

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload script path:', preloadPath);
  console.log('Preload script exists:', fs.existsSync(preloadPath));
  
  // ... rest of window creation
}
```

### 3. Preload Script - Error Handling (electron/preload.ts)

Added try-catch and logging around API exposure:

```typescript
console.log('Preload script loaded');

try {
  contextBridge.exposeInMainWorld('electronAPI', {
    // ... API methods
  });
  
  console.log('electronAPI exposed successfully');
} catch (error) {
  console.error('Error in preload script:', error);
}
```

## Benefits

1. **Prevents Crashes**: App won't crash if electronAPI isn't available
2. **Better Debugging**: Console logs help identify path/loading issues
3. **User Feedback**: Clear error messages when API is unavailable
4. **Graceful Degradation**: App can still show UI even if API fails to load
5. **CI/Build Friendly**: Works in environments where Electron might not be fully initialized

## Debugging

When the app runs, you'll see console output like:

```
Main process __dirname: /path/to/dist-electron
Main process __filename: /path/to/dist-electron/main.js
Preload script path: /path/to/dist-electron/preload.js
Preload script exists: true
Preload script loaded
electronAPI exposed successfully
```

If you see any of these missing or showing errors, it indicates where the problem is:

- **"Preload script exists: false"**: Path resolution issue, preload.js not in expected location
- **Missing "Preload script loaded"**: Preload script didn't execute at all
- **Missing "electronAPI exposed successfully"**: Error during API exposure
- **"electronAPI not available" in renderer**: Preload didn't load or contextBridge failed

## Testing

Build and verify:

```bash
npm run build
npm run electron:dev
```

Check console for the diagnostic messages.

## Future Improvements

If issues persist, consider:

1. Add a retry mechanism for checking electronAPI availability
2. Show a loading screen until electronAPI is confirmed available
3. Add more detailed error messages with troubleshooting steps
4. Create a health check endpoint that verifies all IPC handlers are registered

## Related Files

- `electron/main.ts` - Main process with path logging
- `electron/preload.ts` - Preload script with error handling
- `src/App.tsx` - Renderer with availability checks
- `src/types/electron.d.ts` - TypeScript definitions for electronAPI
