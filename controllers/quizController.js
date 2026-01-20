import Quiz from "../models/Quiz.js";

export const getQuizzes = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const quizzes = await Quiz.find({
      userId: req.user._id,
      documentId: documentId,
    }).sort({ createdAt: -1 });

    console.log(quizzes);

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("documentId", "title");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body; // Array of { questionIndex, selectedAnswer }
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    let score = 0;
    const userAnswers = [];

    // Process answers
    answers.forEach((answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (question) {
        const isCorrect = question.correctAnswer === answer.selectedAnswer;
        if (isCorrect) score++;

        userAnswers.push({
          questionIndex: answer.questionIndex,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
          answeredAt: new Date(),
        });
      }
    });

    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.completedAt = new Date();

    await quiz.save();

    res.status(200).json({
      success: true,
      data: {
        score,
        totalQuestions: quiz.totalQuestions,
        userAnswers,
        percentage: (score / quiz.totalQuestions) * 100,
      },
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (!quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz has not been completed yet",
        statusCode: 400,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        score: quiz.score,
        totalQuestions: quiz.totalQuestions,
        userAnswers: quiz.userAnswers,
        questions: quiz.questions,
        completedAt: quiz.completedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    await Quiz.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
