import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "../components/ThemeRegistry";
import ConvexClientProvider from "../components/ConvexClientProvider";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "OpenNoteLM",
  description: "Chat with your documents. Free. Instant. Persistent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`} suppressHydrationWarning>
        <ConvexClientProvider>
          <ThemeRegistry>
            {children}
          </ThemeRegistry>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
