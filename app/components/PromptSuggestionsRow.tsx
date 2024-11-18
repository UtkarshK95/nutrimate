import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionsRow = ({ onPromptClick }) => {
  const prompts = [
    "Can you provide the nutritional benefits of eggs? What vitamins, minerals, and macronutrients does it contain?",
    "What are some nutrient-dense foods suitable for a keto lifestyle?",
    "Which is healthier between fish and chicken, and why? Please compare their nutritional values.",
    "What are the best foods to include in my diet if I want to improve heart health",
  ];

  return (
    <div className="prompt-suggestion-row">
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton
          key={`suggestion-${index}`}
          text={prompt}
          onClick={() => onPromptClick(prompt)}
        />
      ))}
    </div>
  );
};

export default PromptSuggestionsRow;
