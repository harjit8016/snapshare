# Google AdSense Setup

This application is pre-configured with Google AdSense using environment variables. When your site is live and approved by Google, follow these steps to enable real ads:

## 1. Get your AdSense Credentials
1. Log in to [adsense.google.com](https://adsense.google.com).
2. Get your **Publisher ID** (formatted as `ca-pub-XXXXXXXXXXXXXXXX`).
3. Create 3 Display Ad units and note their **Slot IDs** (10-digit numbers):
   - One **Horizontal** unit for the Header/Upload section.
   - One **Rectangle** unit for the Gallery Sidebar.
   - One **Horizontal** unit for the Footer.

## 2. Update Environment Variables
Open your `.env` file in the root directory and replace the placeholders:

```env
VITE_ADSENSE_CLIENT=your-real-publisher-id
VITE_ADSENSE_SLOT_GALLERY=your-gallery-sidebar-slot-id
VITE_ADSENSE_SLOT_UPLOAD=your-header-upload-slot-id
VITE_ADSENSE_SLOT_FOOTER=your-footer-slot-id
```

## 3. Update index.html
Open `index.html` and replace the placeholder `ca-pub-XXXXXXXXXXXXXXXX` in the `<script>` tag with your real Publisher ID:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```

## 4. Deploy
Redeploy your application. Ads will typically start showing within 24 hours of approval and configuration.

> [!IMPORTANT]
> The `AdBanner` component will automatically handle switching from placeholders to real ads once the environment variables are updated.
