# Creator OS — free backend setup

The app is a static GitHub Pages site. Firebase client configuration and a YouTube OAuth client ID are entered locally in **Settings**; no credentials are committed to this repository. Firebase web config and OAuth client IDs are identifiers, not server secrets. Restrict the YouTube API key by API and HTTP referrer.

## Firebase (Spark plan)
1. Create a project at https://console.firebase.google.com/ and stay on the **Spark (no-cost)** plan.
2. Register a Web app and copy `apiKey`, `authDomain`, `projectId`, `appId` into Settings → Connect Firebase.
3. Authentication → Sign-in method: enable Google and Email/Password.
4. Authentication → Settings → Authorized domains: add `piyushkumar158742-dev.github.io`.
5. Build → Firestore Database → Create database. Open Rules and paste the contents of `firestore.rules`, then Publish.
6. Return to Creator OS → Settings and select **Save connection settings**, then sign in. Workspace changes sync to `users/{uid}/workspace/main`; each user can access only their own document.

## YouTube (works on Firebase Hosting, no client ID or API key needed)
Connect YouTube now uses the same Google sign-in as Firebase Auth, with the read-only YouTube scope. One-time setup in the Google Cloud project behind Firebase (`vyro-cd2fd`):
1. APIs & Services → Library → enable **YouTube Data API v3**.
2. APIs & Services → OAuth consent screen → Data access → add scope `https://www.googleapis.com/auth/youtube.readonly`.
3. While the consent screen is in **Testing**, add every Google account that will connect as a test user (or publish the app).
4. Firebase → Authentication → Settings → Authorized domains must include your hosting domains (`vyro-cd2fd.web.app` and `vyro-cd2fd.firebaseapp.com` are there by default).
5. Deploy with `firebase deploy --only hosting`, open the site, Settings → **Connect YouTube**.

## Free-plan notes
- Firebase Authentication (Google and email/password) and Firestore have no-cost usage, subject to Firebase quotas. Spark projects are capped at the free quota instead of automatically billing overages.
- YouTube Data API has a default daily quota (commonly 10,000 units for most endpoints; quotas can change).
- Do not enable billing or upgrade to Blaze if your budget is zero. Cloud Functions are not required for this first version.
- The app keeps a local copy in this browser even when cloud sync is not configured. Cloud sync begins after Firebase sign-in.
