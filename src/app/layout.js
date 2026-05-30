import "./globals.css";

export const metadata = {
  title: "Depot | Stream yard",
  description: "Depot is a cinematic streaming hub with bold movie rows, curated categories, and premium entertainment discovery.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
