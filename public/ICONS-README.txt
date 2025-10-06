PWA ICON SETUP NEEDED
======================

The app currently uses favicon.ico as a fallback for mobile app icons.
For better appearance on mobile devices, create PNG icons from loadflow-pro-logo.svg:

Required Icon Sizes:
-------------------
- icon-192.png (192x192 pixels)
- icon-512.png (512x512 pixels)
- apple-touch-icon.png (180x180 pixels)

Quick Method:
-------------
1. Go to https://realfavicongenerator.net/
2. Upload public/loadflow-pro-logo.svg
3. Generate icons
4. Download and place in /public/ folder
5. Update manifest.json to reference the PNG files

OR use any image editor to export the SVG as PNG at the required sizes.

Once created, update:
- public/manifest.json (update icon src paths)
- src/pages/_document.js (update apple-touch-icon paths)

This will fix the "Add to Home Screen" icon display on mobile devices.

