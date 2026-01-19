import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    cards: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        Difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
        LastReviewed: {
          type: Date,
          default: null,
        },
        ReviewCount: {
          type: Number,
          default: 0,
        },
        isStarred: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true },
);

flashcardSchema.index({ userId: 1, documentId: 1 });

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

export default Flashcard;
