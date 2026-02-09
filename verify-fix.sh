#!/bin/bash
echo "==================================="
echo "Electron TypeScript Fix Verification"
echo "==================================="
echo ""

echo "1. Checking project structure..."
[ -f "vite.config.ts" ] && echo "   ✓ vite.config.ts exists" || echo "   ✗ vite.config.ts missing"
[ -f "electron/tsconfig.json" ] && echo "   ✓ electron/tsconfig.json exists" || echo "   ✗ electron/tsconfig.json missing"
[ -f "electron/main.ts" ] && echo "   ✓ electron/main.ts exists" || echo "   ✗ electron/main.ts missing"
echo ""

echo "2. Checking package.json configuration..."
grep -q '"main": "dist-electron/main.js"' package.json && echo "   ✓ main entry points to compiled output" || echo "   ✗ main entry incorrect"
grep -q '"electron:dev": "vite"' package.json && echo "   ✓ electron:dev script configured" || echo "   ✗ electron:dev script missing"
echo ""

echo "3. Running build test..."
npm run build > /tmp/build-output.txt 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ Build successful"
    [ -f "dist-electron/main.js" ] && echo "   ✓ main.js compiled" || echo "   ✗ main.js not found"
    [ -f "dist-electron/preload.js" ] && echo "   ✓ preload.js compiled" || echo "   ✗ preload.js not found"
else
    echo "   ✗ Build failed"
    cat /tmp/build-output.txt
fi
echo ""

echo "4. Checking compiled output..."
if [ -f "dist-electron/main.js" ]; then
    SIZE=$(du -h dist-electron/main.js | cut -f1)
    echo "   ✓ main.js size: $SIZE"
    head -3 dist-electron/main.js | grep -q "import" && echo "   ✓ ESM imports preserved" || echo "   ✗ Module format incorrect"
fi
echo ""

echo "==================================="
echo "Verification Complete!"
echo "==================================="
