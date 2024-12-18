import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "TALLA - Join The Waitlist",
  description: "A new step in the social direction.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
            <head>
            <meta httpEquiv='cache-control' content='no-cache' />
            <meta httpEquiv='expires' content='0' />
            <meta httpEquiv='pragma' content='no-cache' />
            </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
