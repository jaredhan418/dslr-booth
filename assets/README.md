# Assets Directory

This directory contains application assets such as icons and images.

## Icon Files

For a production application, you should create proper icon files:

### Windows
- `icon.ico` - Windows icon file (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)

### macOS (future)
- `icon.icns` - macOS icon file

### Linux (future)
- `icon.png` - PNG icon (512x512)

## Creating Icons

### Method 1: Using Online Tools
1. Create a 512x512 PNG image with your logo
2. Use online converters:
   - https://convertico.com/ (for .ico)
   - https://iconverticons.com/ (for .icns)

### Method 2: Using Command Line Tools

**For Windows (.ico):**
```bash
npm install -g icon-gen
icon-gen -i icon.png -o . --ico
```

**For macOS (.icns):**
```bash
npm install -g icon-gen
icon-gen -i icon.png -o . --icns
```

## Icon Design Guidelines

- Use simple, recognizable symbols
- Ensure good visibility at small sizes (16x16, 32x32)
- Use a transparent background or solid color
- High contrast for visibility
- Represent the application's purpose (camera/photo related)

## Current Status

The application currently uses a placeholder icon. For production use, please create professional icon files and place them in this directory.

## Recommended Icon Concept

A camera icon with a booth/frame element to represent the photo booth concept:
- 📷 Camera symbol
- 🖼️ Frame/border element
- Modern, clean design
- Compatible with light and dark themes
