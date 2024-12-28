"use client";

import Image from "next/image";
import logo from "./assets/logo.png";
import { useChat } from "ai/react";
import { Message } from "ai";
import Bubble from "./components/Bubble";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionsRow from "./components/PromptSuggestionsRow";

const Home = () => {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  const noMessages = !messages || messages.length === 0;

  const handlePrompt = (promptText) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      content: promptText,
      role: "user",
    };
    append(msg);
  };

  return (
    <main>
      <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        <Image
          src={logo}
          alt="logo"
          layout="responsive"
          width={100} // These represent the aspect ratio, not pixel size
          height={50} // For a 2:1 aspect ratio/>
        />
      </div>
      <section className={noMessages ? "" : "populated"}></section>
      <section>
        {noMessages ? (
          <>
            <p className="starter-text">
              Your Trusted Nutrition Expert, Powered by Gen AI and Backed by
              Science.
            </p>
            <br />
            <PromptSuggestionsRow onPromptClick={handlePrompt} />
          </>
        ) : (
          <>
            {messages.map((message, index) => (
              <Bubble key={`message-${index}`} message={message} />
            ))}
            {isLoading && <LoadingBubble />}
          </>
        )}
      </section>

      <form onSubmit={handleSubmit}>
        <input
          className="question-box"
          onChange={handleInputChange}
          value={input}
          placeholder="Ask me something..."
        />
        <input type="submit" />
      </form>
    </main>
  );
};

export default Home;
