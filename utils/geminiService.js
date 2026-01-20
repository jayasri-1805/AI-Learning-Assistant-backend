import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.",
  );
  process.exit(1);
}

/**
 * Generate flashcards from text
 * @param { string } text - Document text
 * @param { number } count - Number of flashcards to generate
 * @returns { Promise < Array < { question: string, answer: string, difficulty: string } >>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
Format each flashcard as:
        Q: [Clear, specific question]
        A: [Concise, accurate answer]
        D: [Difficulty level: easy, medium, or hard]

Separate each flashcard with " --- "

Text:
${text.substring(0, 15000)} `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;
    // console.log("Flashards ", generatedText);
    const flashcards = [];
    // Use regex to split cards, handling newlines and spaces around the separator
    const cards = generatedText.split(/\n\s*---\s*\n/).filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "",
        answer = "",
        difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }
    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate flashcards");
  }
};
/**
 * Generate quiz from text
 * @param { string } text - Document text
 * @param { number } numQuestions - Number of questions
 * @returns { Promise < Array < { question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string } >>}
 */

export const generateQuiz = async (text, numQuestions) => {
  const prompt = `Generate a quiz with exactly ${numQuestions} multiple-choice questions from the following text.
  Return the response ONLY as a raw JSON array of objects. Do not wrap it in markdown code blocks or any other text.
  
  Each object in the array must follow this structure:
  {
    "question": "The question text",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "The correct option text (must match exactly one of the options)",
    "explanation": "Brief explanation of why the answer is correct",
    "difficulty": "easy", "medium", or "hard"
  }

  Text:
  ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text.trim();

    // Clean up potential markdown code blocks if the model ignores the "ONLY raw JSON" instruction
    const jsonString = generatedText
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    let questions;
    try {
      questions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error(
        "JSON Parse Error:",
        parseError,
        "Generated Text:",
        generatedText,
      );
      throw new Error("Failed to parse quiz data from AI response");
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI generated an empty or invalid quiz structure");
    }

    // Validate structure of each question
    const validQuestions = questions.filter(
      (q) =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.correctAnswer &&
        q.options.includes(q.correctAnswer),
    );

    if (validQuestions.length === 0) {
      throw new Error(
        "No valid questions could be parsed from the AI response",
      );
    }

    return validQuestions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};

/**
 * Generate documentsummary
 * @param { string } text - Document text
 * @returns { Promise < string >}
 */

export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text, highlighting the key points and main ideas, and important points.
   Keep the summary clear and structured.
   
   Text:
   ${text.substring(0, 20000)} `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate summary");
  }
};

/**
 * Chat with document context
 * @param { string } question - User question
 * @param { Array < Object > } chunks - Relevant document chunks
 * @returns { Promise < string >}
 */

export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join("\n\n");

  //   console.log("Context________", context);

  const prompt = `Based on the following document context, analyze the context and answer the user's question.
    If the answer is not in the context, say so.

    Context:
    ${context}

    Question:${question}
    Answer: `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to process chat request");
  }
};

/**
 * Explain a specificconcept
 * @param { string } concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns { Promise < string >}
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Explain the concept of ${concept} based on the following context.
    Provide a clear, educational explanation that's easy to understand.
    Include examples if relevant.

    Context:
    ${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to explain concept");
  }
};
