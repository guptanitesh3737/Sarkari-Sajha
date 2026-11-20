package com.sarkarisajha.app.model

data class QuizQuestion(
    val id: String = "",
    val questionText: String = "",
    val questionTextNp: String = "",
    val options: List<String> = emptyList(),
    val optionsNp: List<String> = emptyList(),
    val correctOption: Int = 0,
    val explanation: String = "",
    val explanationNp: String = "",
    val topic: String = "General Knowledge",
    val subject: String = "Lok Sewa / PSC"
)

data class QuizSet(
    val id: String = "",
    val title: String = "",
    val titleNp: String = "",
    val category: String = "Lok Sewa / PSC",
    val subject: String = "General Knowledge",
    val level: String = "Kharidar / Subba / Officer",
    val timeLimitMinutes: Int = 20,
    val totalQuestions: Int = 20,
    val negativeMarkRate: Double = 0.20,
    val passingPercentage: Double = 50.0,
    val description: String = "",
    val questions: List<QuizQuestion> = emptyList()
)

data class QuizAttempt(
    val id: String = "",
    val quizSetId: String = "",
    val quizTitle: String = "",
    val userId: String = "",
    val userName: String = "",
    val score: Double = 0.0,
    val correctCount: Int = 0,
    val incorrectCount: Int = 0,
    val unattemptedCount: Int = 0,
    val negativeMarksDeducted: Double = 0.0,
    val totalQuestions: Int = 0,
    val percentage: Double = 0.0,
    val passed: Boolean = false,
    val timeTakenSeconds: Int = 0,
    val attemptedAt: String = ""
)
