import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bakchod Pink Gang — Truth or Dare",
  description:
    "Spin the bottle, pick Truth or Dare, and party with friends online!",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍾</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
