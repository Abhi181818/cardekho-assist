import "./globals.css";

export const metadata = {
  title: "CarDekho AI Advisor",
  description: "Find your perfect car with AI-powered recommendations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
