import "./global.css";

export const metadata = {
  title: "Nutrimate",
  description:
    "A RAG Chatbot powered by Gen AI delivers precise, verified answers to nutrition questions, drawing from reputable research papers, medical journals, and government health sites.",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
