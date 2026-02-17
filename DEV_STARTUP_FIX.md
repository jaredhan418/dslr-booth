# Dev Startup Fix: Preload Script Loading

## Problem

When running `npm run dev`, the following error occurred:

```
Unable to load preload script: D:\CodeRepo\dslr-booth\dist-electron\preload.js
```

This happened because the `dist-electron` directory and its files didn't exist when Electron tried to start.

## Root Cause

1. **Missing Build Step**: On fresh checkout, `dist-electron/` doesn't exist
2. **Missing onstart Handlers**: vite-plugin-electron wasn't configured to ensure proper build order
3. **Race Condition**: Electron could start before preload script was built
4. **Missing Renderer Plugin**: No HMR support for development mode

## Solution

Updated `vite.config.ts` with proper vite-plugin-electron configuration pattern.

### Changes Made

```typescript
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron([
      {
        entry: 'electron/main.ts',
        onstart(options) {
          // Start Electron only after build completes
          options.startup();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          // Reload preload script on changes
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer()  // Enable HMR for Electron renderer process
  ],
  // ... rest of config
});
```

### Key Points

1. **onstart Handler for Main Process**
   - Uses `options.startup()` to launch Electron
   - Only called after main.ts is built
   - Ensures Electron doesn't start prematurely

2. **onstart Handler for Preload**
   - Uses `options.reload()` to refresh preload
   - Enables HMR for preload script changes
   - Notifies main process when preload updates

3. **Renderer Plugin**
   - Adds `vite-plugin-electron-renderer`
   - Enables HMR for React app in Electron
   - Allows using Node.js APIs in renderer if needed

## How It Works

### Development Mode (`npm run dev`)

1. Vite starts
2. Electron main process builds → `dist-electron/main.js`
3. Preload script builds → `dist-electron/preload.js`
4. `onstart` callback runs with `options.startup()`
5. Electron launches with preload available
6. React dev server starts
7. HMR enabled for both Electron and React

### Build Sequence

```
npm run dev
    ↓
Vite starts
    ↓
Build electron/main.ts
    ↓
Build electron/preload.ts
    ↓
onstart callback
    ↓
options.startup()
    ↓
Electron launches
    ↓
Preload script loaded
    ↓
React app renders
```

## Build Output

After build, the following files are created:

```
dist-electron/
├── main.js       # 17.74 kB (gzip: 4.66 kB)
└── preload.js    # 1.02 kB (gzip: 0.45 kB)
```

## Verification

To verify the fix works:

```bash
# Fresh start
rm -rf dist-electron node_modules
npm install

# Build
npm run build

# Verify files exist
ls -lh dist-electron/
# Should show main.js and preload.js

# Run dev mode
npm run dev
# Should start without "Unable to load preload script" error
```

## Common Issues

### Issue: "Cannot find module './preload.js'"

**Cause**: Preload script not built yet  
**Solution**: Ensure `onstart` handlers are configured in vite.config.ts

### Issue: "Electron starts but window is blank"

**Cause**: Missing renderer plugin or incorrect base path  
**Solution**: Add `renderer()` plugin and set `base: './'` in vite.config.ts

### Issue: "preload.js exists but still errors"

**Cause**: Path resolution issue (Windows vs Unix)  
**Solution**: Use `path.join(__dirname, 'preload.js')` in main.ts (already implemented)

## Related Files

- `vite.config.ts` - Vite and plugin configuration
- `electron/main.ts` - Main process with preload path
- `electron/preload.ts` - Preload script source
- `package.json` - Scripts and dependencies

## Additional Notes

This is a standard pattern for vite-plugin-electron v0.29.0+. The plugin documentation recommends using `onstart` handlers to ensure proper build sequencing.

Without these handlers, the plugin builds files asynchronously but doesn't guarantee they're ready before Electron starts, leading to the "Unable to load preload script" error.

## References

- [vite-plugin-electron Documentation](https://github.com/electron-vite/vite-plugin-electron)
- [Electron Preload Scripts](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload)
- [Vite Documentation](https://vitejs.dev/)
