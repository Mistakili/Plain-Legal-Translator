# SignSafe iOS App — Build & Submit Guide

## Prerequisites

- Mac with Xcode 15+ installed
- Apple Developer Account (enrolled in Apple Developer Program)
- CocoaPods installed (`sudo gem install cocoapods`)
- Node.js 18+ installed on your Mac

---

## Step 1: Clone and Build on Your Mac

```bash
# Clone your Replit project (or download as ZIP)
# Then navigate to the project folder

# Install dependencies
npm install

# Build the web assets
npm run build

# Initialize the iOS project
npx cap add ios

# Sync web assets to the iOS project
npx cap sync ios
```

## Step 2: Configure App Icons

The app icons are already generated in `client/public/icons/`. After running `cap add ios`, you need to add them to the Xcode asset catalog:

1. Open `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
2. Replace the placeholder icons with the generated PNGs from `client/public/icons/`
3. The `icon-1024x1024.png` is your App Store icon

Alternatively, use a tool like [App Icon Generator](https://appicon.co/) with the `icon-1024x1024.png` to generate the full iOS icon set.

## Step 3: Open in Xcode

```bash
npx cap open ios
```

This opens the Xcode project at `ios/App/App.xcworkspace`.

## Step 4: Configure Signing

1. In Xcode, select the **App** target
2. Go to **Signing & Capabilities** tab
3. Check **Automatically manage signing**
4. Select your **Team** (your Apple Developer account)
5. Set **Bundle Identifier** to: `com.signsafe.app`

## Step 5: Configure App Settings

In Xcode, under **General** tab:

| Setting | Value |
|---------|-------|
| Display Name | SignSafe |
| Bundle Identifier | com.signsafe.app |
| Version | 1.0.0 |
| Build | 1 |
| Deployment Target | iOS 16.0 |

## Step 6: Set the Server URL

SignSafe needs a backend server. By default, the Capacitor config bundles the frontend files locally so the app loads instantly. But API calls need to reach your deployed server.

**Option A — Fully local (recommended for App Store):**  
The default config bundles all frontend files into the app. API calls go to relative URLs, so you need to update `capacitor.config.ts` to proxy API requests:

```typescript
server: {
  iosScheme: 'https',
  url: 'https://your-deployed-url.replit.app',
},
```

**Option B — For development/testing only:**
```typescript
server: {
  iosScheme: 'https',
  url: 'http://your-mac-ip:5000',
  cleartext: true,
},
```

After changing the config, rebuild:
```bash
npm run build
npx cap sync ios
```

## Step 7: Test on Simulator or Device

### Simulator
1. In Xcode, select an iPhone simulator (e.g., iPhone 15 Pro)
2. Click the **Play** button (⌘R)
3. The app launches in the simulator

### Physical Device
1. Connect your iPhone via USB
2. Select your device in the device dropdown
3. Click **Play** (⌘R)
4. Trust the developer certificate on your iPhone: Settings → General → VPN & Device Management

## Step 8: Submit to App Store

### Create App Store Connect Record
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: SignSafe
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: com.signsafe.app
   - **SKU**: signsafe-001

### Prepare App Store Listing
You'll need:
- **App Name**: SignSafe — AI Contract Translator
- **Subtitle**: Understand Every Clause Before You Sign
- **Description**:
  ```
  SignSafe uses AI to translate complex legal documents into plain English. 
  Upload any contract and instantly get a clear, jargon-free translation 
  with automatic risk flag detection.

  KEY FEATURES:
  • AI Contract Analysis — Upload contracts and get plain English translations
  • Risk Detection — Automatically identify risky clauses with severity levels
  • AI Follow-Up Chat — Ask questions about your document and get instant answers
  • E-Signatures — Sign documents and request signatures right from the app
  • Google Drive Import — Pull contracts directly from your Google Drive
  • PDF Download — Download signed documents as professional PDFs

  SignSafe is like having a lawyer on call — but faster, cheaper, and available 24/7.
  Free to start with 3 analyses per month.
  ```
- **Keywords**: contract analysis, legal translator, AI lawyer, e-signature, document signing, risk detection, plain english, legal tech
- **Category**: Business (Primary), Productivity (Secondary)
- **Privacy Policy URL**: https://your-deployed-url.replit.app/privacy
- **Support URL**: https://your-deployed-url.replit.app
- **Screenshots**: Take screenshots from the simulator (⌘S in Simulator)
  - Need: 6.7" (iPhone 15 Pro Max), 6.5" (iPhone 14 Plus), 5.5" (iPhone 8 Plus) optional

### Upload Build
1. In Xcode: **Product** → **Archive**
2. In the Organizer window, click **Distribute App**
3. Select **App Store Connect** → **Upload**
4. Follow the prompts

### Submit for Review
1. In App Store Connect, select your app
2. Add screenshots, description, and all metadata
3. Select the uploaded build
4. Click **Submit for Review**

Review typically takes 24-48 hours.

---

## Updating the App

When you make changes to SignSafe:

```bash
# Build updated web assets
npm run build

# Sync to iOS
npx cap sync ios

# Open Xcode and create new archive
npx cap open ios
```

Then archive and upload again in Xcode.

---

## Troubleshooting

### "No signing certificate" error
→ In Xcode Preferences → Accounts, make sure your Apple ID is added and certificates are downloaded.

### White screen on launch
→ Make sure `npm run build` completed successfully and `dist/public/` has your built files. Then run `npx cap sync ios` again.

### API calls failing
→ Check that the `server.url` in `capacitor.config.ts` points to your deployed backend. iOS requires HTTPS for production.

### CocoaPods issues
```bash
cd ios/App
pod install --repo-update
```

---

## Contact
akinslaboratory@gmail.com
