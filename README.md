This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## CarDekho AI Advisor — Local run notes

This repository contains a minimal conversational car advisor MVP.

- Create a `.env.local` in the project root and add your Gemini API key (optional for local dev):

If you want the app to call the official Google Generative Language client, set this env var in `.env.local`:

```env
GENERATIVE_API_KEY=your_api_key_here
```

(If you don't set `GENERATIVE_API_KEY` the app uses a safe local mock response.)

- Start the dev server:

```bash
npm install
npm run dev
```

- The app runs at `http://localhost:3000` (or the next available port). If no `GEMINI_API_KEY` is provided the server returns a safe mock response useful for development.

