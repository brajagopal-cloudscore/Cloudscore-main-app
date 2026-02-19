import { ClerkProvider } from "@/provider/clerk.provider";
import { Providers } from "./providers";
import { ThemedToaster } from "@/components/common/toaster";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { ServerErrorPage } from "@/components/error/CustomErrorPage";
import PostHogProvider from "@/post-hog/PostHogProvider";
import { ThemeProvider } from "@/provider/theme.provider";
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Only load Vercel analytics on Vercel
let SpeedInsights: any = null;
let Analytics: any = null;

if (process.env.NEXT_PUBLIC_VERCEL === "1") {
  try {
    SpeedInsights = require("@vercel/speed-insights/next").SpeedInsights;
    Analytics = require("@vercel/analytics/react").Analytics;
  } catch (e) {
    // Vercel analytics not available
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.className}`}>
        <ThemeProvider>
          <PostHogProvider>
            <ClerkProvider>
              {SpeedInsights && <SpeedInsights />}
              <ThemedToaster />
              {Analytics && <Analytics />}
              <Providers>
                <ErrorBoundary fallback={<ServerErrorPage />}>
                  {children}
                </ErrorBoundary>
              </Providers>
            </ClerkProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
