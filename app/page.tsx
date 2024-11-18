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

  const noMessages = false;

  return (
    <main>
      <Image src={logo} width={250} alt="logo" />
      <section className={noMessages ? "" : "populated"}></section>
      <section>
        {noMessages ? (
          <>
            <p className="starter-text">
              The Ultimate place for Formula One super fans! Ask F1GPT anything
              about the fantastic topic of F1 racing and it will come back with
              the most up-to-date answers. We hope you enjoy!
            </p>
            <br />
            <PromptSuggestionsRow />
          </>
        ) : (
          <>
            {/*map messages onto text bubbles*/}
            <LoadingBubble />
          </>
        )}
      </section>
      <input
        className="question-box"
        onChange={handleInputChange}
        value={input}
        placeholder="Ask me something..."
      />
      <input type="submit" />
    </main>
  );
};

export default Home;
