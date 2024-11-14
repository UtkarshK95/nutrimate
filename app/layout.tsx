import "./global.css";

export const metadata = {
  title: "ARM Chat",
  description: "AI companion for all your queries",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
