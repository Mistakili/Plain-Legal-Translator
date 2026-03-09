#!/bin/bash
set -e

echo "=== SignSafe iOS Build ==="
echo ""

echo "Step 1: Building web assets..."
npm run build

echo ""
echo "Step 2: Syncing with Capacitor..."
npx cap sync ios

echo ""
echo "=== Build complete! ==="
echo ""
echo "Next steps:"
echo "  1. Open the Xcode project:  npx cap open ios"
echo "  2. Select your signing team in Xcode"
echo "  3. Build and run on your device or simulator"
echo ""
