<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BeautyConnect AI

## Deployment to Vercel

To deploy this project to Vercel, follow these steps:

1.  **Push the code to GitHub.**
2.  **Import the project in Vercel.**
3.  **Add Environment Variables:**
    *   In the Vercel project settings, go to **Environment Variables**.
    *   Add `GEMINI_API_KEY` with your API key value.
4.  **Deploy.**

The application is configured with `vercel.json` to handle SPA routing correctly.

View your app in AI Studio: https://ai.studio/apps/drive/1iF9LIHQAkj6_ANuYmd4i7uz_IfixJuVc

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
