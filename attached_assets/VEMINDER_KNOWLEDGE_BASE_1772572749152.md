# Veminder Knowledge Base — Portable Skills & Patterns

This document captures all hard-won knowledge from building and shipping Veminder (vemind.click) as an iOS app on the App Store. Use this as a reference when building any new Replit web app that needs to become a native iOS app with push notifications, subscriptions, and App Store compliance.

---

## 1. Capacitor iOS Setup (Web → Native App)

### Config Template (`capacitor.config.ts`)
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.yourapp',  // Must match Apple Developer Portal
  appName: 'YourApp',
  webDir: 'dist/public',  // Vite build output
  server: {
    url: 'https://your-domain.com',  // Remote server, not bundled
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: false,
    allowNavigation: [
      'your-domain.com', '*.your-domain.com',
      '*.replit.app', '*.replit.com', '*.replit.dev',
      '*.google.com', '*.googleapis.com',
      '*.github.com', '*.apple.com', '*.icloud.com'
    ]
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'yourapp',  // Custom URL scheme for deep links
    backgroundColor: '#000000',
    allowsLinkPreview: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    StatusBar: {
      style: 'Light',
      backgroundColor: '#000000'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  }
};

export default config;
```

### Required NPM Packages
```json
{
  "@capacitor/core": "^6",
  "@capacitor/cli": "^6",
  "@capacitor/ios": "^6",
  "@capacitor/push-notifications": "^6",
  "@capacitor/splash-screen": "^6",
  "@capacitor/status-bar": "^6",
  "@capacitor/app": "^6",
  "@capacitor/browser": "^6"
}
```

### Build & Deploy Commands
```bash
# First time setup
npx vite build --config vite.config.ts
npx cap add ios
npx cap sync ios

# After code changes
npx vite build --config vite.config.ts
npx cap sync ios
npx cap open ios

# Quick sync (web assets only)
npx cap copy ios

# Full sync (web assets + plugins + pods)
npx cap sync ios
```

### Critical iOS Gotchas

1. **WKAppBoundDomains in Info.plist** — Without this, you get a white screen. Must list your server domain:
```xml
<key>WKAppBoundDomains</key>
<array>
  <string>your-domain.com</string>
  <string>your-app.replit.app</string>
</array>
```

2. **CORS for WKWebView** — Server must allow `capacitor://localhost` origin:
```typescript
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === 'capacitor://localhost') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  next();
});
```

3. **Cookie Policy** — Must use `sameSite: "none"` with `secure: true` for cross-origin cookie support in WKWebView.

4. **Service Worker** — Auto-skip on native platforms (not supported in WKWebView):
```typescript
if (Capacitor.isNativePlatform()) {
  console.log('Service Worker skipped on native platform');
  return false;
}
```

5. **Dynamic Imports** — Use `/* @vite-ignore */` pattern instead of `new Function()` to avoid Apple rejection:
```typescript
const { SplashScreen } = await import(/* @vite-ignore */ "@capacitor/splash-screen");
```

6. **Error Boundary** — Wrap entire app to prevent crash-to-white-screen.

7. **AppDelegate.swift** — `npx cap sync` does NOT update AppDelegate. You must manually copy it to Xcode every time.

8. **Platform Detection:**
```typescript
import { Capacitor } from "@capacitor/core";
const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform(); // "ios" | "android" | "web"
```

---

## 2. APNs Push Notifications (Native iOS)

### Server-Side Setup (`server/apns.ts`)

Uses `node-apn-http2` package. Key pattern for normalizing the .p8 key:

```typescript
import apn from "node-apn-http2";

function normalizeP8Key(raw: string): string {
  const header = "-----BEGIN PRIVATE KEY-----";
  const footer = "-----END PRIVATE KEY-----";
  let cleaned = raw.trim().replace(/\\n/g, "\n");
  
  if (cleaned.includes(header) && cleaned.includes(footer)) {
    const headerIdx = cleaned.indexOf(header);
    const footerIdx = cleaned.indexOf(footer);
    const body = cleaned.substring(headerIdx + header.length, footerIdx).replace(/[\r\n\s]/g, "");
    const lines: string[] = [header];
    for (let i = 0; i < body.length; i += 64) {
      lines.push(body.substring(i, i + 64));
    }
    lines.push(footer);
    return lines.join("\n");
  }
  
  cleaned = cleaned.replace(/[\r\n\s]/g, "");
  const lines: string[] = [header];
  for (let i = 0; i < cleaned.length; i += 64) {
    lines.push(cleaned.substring(i, i + 64));
  }
  lines.push(footer);
  return lines.join("\n");
}
```

### Required Secrets
- `APNS_KEY_ID` — From Apple Developer Portal → Keys
- `APNS_TEAM_ID` — Your Apple Developer Team ID
- `APNS_KEY_CONTENT` — Contents of the .p8 key file
- `APNS_BUNDLE_ID` — Your app bundle ID (e.g., com.yourcompany.yourapp)

### Rich Notification Pattern
```typescript
const notification = new apn.Notification();
notification.alert = {
  title: "Task Reminder",
  subtitle: "💼 Work • ⚡ Urgent • 3:00 PM",  // iOS subtitle field
  body: "Call the client about the proposal"
};
notification.topic = bundleId;
notification.sound = "default";
notification.badge = 1;
notification.category = "TASK_REMINDER";  // For action buttons
notification.threadId = "task-work";  // Groups in notification center
```

### Token Validation
- iOS tokens must be 64 hex characters
- Auto-delete invalid tokens on 410/BadDeviceToken response
- Upsert by (userId, platform) to prevent duplicate tokens

### Client-Side (`client/src/lib/notifications.ts`)

Key patterns:
- Use `@capacitor/push-notifications` for native
- Fall back to Web Push (VAPID) for browsers
- Wait for token with timeout + polling (Apple can be slow)
- Check for injected token via `window.__nativePushToken` from AppDelegate
- Register service worker only on web (skip on native)

### AppDelegate.swift Template
```swift
import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        registerNotificationCategories()
        return true
    }

    func registerNotificationCategories() {
        let snooze5 = UNNotificationAction(identifier: "SNOOZE_5", title: "Snooze 5min", options: [])
        let snooze15 = UNNotificationAction(identifier: "SNOOZE_15", title: "Snooze 15min", options: [])
        let snooze30 = UNNotificationAction(identifier: "SNOOZE_30", title: "Snooze 30min", options: [])
        let complete = UNNotificationAction(identifier: "COMPLETE", title: "Mark Done", options: [.destructive])

        let taskCategory = UNNotificationCategory(
            identifier: "TASK_REMINDER",
            actions: [snooze5, snooze15, snooze30, complete],
            intentIdentifiers: [],
            options: []
        )
        UNUserNotificationCenter.current().setNotificationCategories([taskCategory])
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
```

---

## 3. RevenueCat Subscriptions (In-App Purchases)

### Architecture
- **Web SDK**: `@revenuecat/purchases-js` for browser
- **Native SDK**: `@revenuecat/purchases-capacitor` for iOS/Android
- Auto-detect platform and use correct SDK
- Use **email** as RevenueCat `appUserId` for cross-platform identity

### Required Secrets
- `REVENUECAT_API_KEY` — Web billing public API key
- `REVENUECAT_IOS_API_KEY` — iOS-specific public key (optional, falls back to web key)
- `REVENUECAT_WEBHOOK_SECRET` — For webhook authorization

### Server Endpoints
- `GET /api/revenuecat/config` — Returns platform-specific API key to client
- `POST /api/revenuecat/webhook` — Receives subscription lifecycle events
- `GET /api/subscription` — Returns user's subscription status

### Webhook Events to Handle
- `INITIAL_PURCHASE` — User subscribed
- `RENEWAL` — Subscription renewed
- `EXPIRATION` — Subscription expired
- `CANCELLATION` — User cancelled
- `BILLING_ISSUE` — Payment failed
- `PRODUCT_CHANGE` — Plan changed

### Client Pattern (`client/src/lib/revenuecat.ts`)
Key behaviors:
- `initRevenueCat(userId)` — Configures SDK, tries native first, falls back to web
- `getOfferings()` — Fetches available packages
- `purchasePackage(pkg, email)` — Handles purchase with native/web branching
- `restorePurchases()` — Apple-required restore button
- `syncPurchaseWithServer()` — POST to server to sync subscription state
- Store raw native packages for purchase (deep clone issues with Capacitor bridge)
- Graceful degradation — app works without RevenueCat keys configured

### Xcode Capabilities Required
- Push Notifications
- In-App Purchase
- Background Modes → Remote notifications

---

## 4. Browser TTS (Text-to-Speech)

### iOS Safari Gotcha
`speechSynthesis.speak()` is **blocked** unless called directly from a user gesture. If you do an async fetch first, iOS silently refuses.

**Fix: Prime with empty utterance immediately on click:**
```typescript
const handleClick = async () => {
  // Prime IMMEDIATELY in user gesture
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
  
  // Now safe to fetch
  const response = await fetch('/api/get-text');
  const { text } = await response.json();
  
  // This will work because we primed above
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
};
```

### Voice Loading
Voices load asynchronously. Use `onvoiceschanged` event + timeout fallback:
```typescript
window.speechSynthesis.onvoiceschanged = () => {
  cachedVoices = window.speechSynthesis.getVoices();
};
setTimeout(() => {
  cachedVoices = window.speechSynthesis.getVoices();
}, 1000);
```

---

## 5. Service Worker (Offline Caching + Push)

### Caching Strategy
- **Navigation (HTML)**: Network-first, cache fallback
- **Static assets** (JS, CSS, fonts, images): Cache-first, network fallback
- **API calls**: Network-only (never cache)
- **Pre-cache** on install: `/`, `/favicon.png`
- **Clean old caches** on activate using version-based cache names

### Push Handling in SW
Service worker handles push events for both web and as a fallback display layer:
```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  // Build notification with action buttons
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  // Handle snooze actions, navigation, etc.
});
```

---

## 6. App Store Compliance Checklist

### Required Pages
- `/privacy` — Privacy Policy (must disclose AI services, data collection)
- `/terms` — Terms of Service (subscription terms, AI disclosure, account deletion policy)

### Required Features
- **Restore Purchases** button on Premium/subscription page
- **In-app account deletion** (cascade delete all user data)
- **AI consent modal** before using AI features (disclose what data is sent where)
- **Subscription terms** visible before purchase (auto-renewal, cancellation details)

### Required Files
- `PrivacyInfo.xcprivacy` — Privacy manifest (required since April 2024)
- App icons in all required sizes (1024x1024 minimum)
- Info.plist entries for: push notifications, microphone, speech recognition, background modes

### Info.plist Required Entries
```xml
<key>NSUserNotificationsUsageDescription</key>
<string>App sends you reminders at the times you set.</string>

<key>NSMicrophoneUsageDescription</key>
<string>App uses your microphone for voice input.</string>

<key>NSSpeechRecognitionUsageDescription</key>
<string>App uses speech recognition to convert your voice to text.</string>

<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>

<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

---

## 7. Replit-Specific Patterns

### Authentication
- Uses Replit Auth via OIDC (Google, GitHub, Apple, email sign-in)
- Session stored in PostgreSQL via `connect-pg-simple`
- Admin bypass: check email against admin list for auto-premium

### Logout Flow
Always use `window.location.href = "/"` (full page reload) instead of client-side routing after logout. This clears React Query cache and ensures session cookie is properly gone.

### Database
- PostgreSQL via `DATABASE_URL` environment variable
- Drizzle ORM for schema + queries
- Schema in `shared/schema.ts` shared between client and server
- Use `npm run db:push` to sync schema (never manually write migrations)

### Deployment
- Replit handles build, hosting, TLS, health checks
- Published under `.replit.app` domain or custom domain
- Custom domain: configure DNS A/CNAME records pointing to Replit

---

## 8. Common Pitfalls & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| White screen on iOS launch | Missing WKAppBoundDomains | Add domains to Info.plist |
| Cookies not working in WKWebView | Wrong sameSite policy | Use `sameSite: "none"`, `secure: true` |
| Speech synthesis silent on iOS | Async gap breaks user gesture | Prime with empty utterance |
| Push token not received | AppDelegate not forwarding | Manually update AppDelegate.swift |
| `new Function()` rejection | Apple blocks dynamic code | Use `/* @vite-ignore */` dynamic imports |
| Logout doesn't clear state | React Query cache stale | Use `window.location.href` for full reload |
| RevenueCat purchase fails | Capacitor bridge serialization | Store and use raw native package objects |
| Service worker in WKWebView | Not supported | Skip SW registration on native |
| Pod install fails | Stale cache | `pod deintegrate && pod install --repo-update` |
| 410 from APNs | Bad/expired device token | Auto-delete token from DB |
