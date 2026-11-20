package com.sarkarisajha.app.ui.quiz

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sarkarisajha.app.model.QuizAttempt
import com.sarkarisajha.app.model.QuizSet
import com.sarkarisajha.app.repository.AuthRepository
import com.sarkarisajha.app.repository.QuizRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class QuizUiState(
    val isLoading: Boolean = true,
    val quizSets: List<QuizSet> = emptyList(),
    val activeQuizSet: QuizSet? = null,
    val userAttempts: List<QuizAttempt> = emptyList(),
    val currentQuestionIndex: Int = 0,
    val selectedAnswers: Map<Int, Int> = emptyMap(), // questionIndex -> optionIndex
    val isQuizFinished: Boolean = false,
    val lastAttemptResult: QuizAttempt? = null,
    val error: String? = null
)

class QuizViewModel(
    private val quizRepository: QuizRepository = QuizRepository(),
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(QuizUiState())
    val uiState: StateFlow<QuizUiState> = _uiState.asStateFlow()

    init {
        loadQuizSets()
        loadUserAttempts()
    }

    private fun loadQuizSets() {
        viewModelScope.launch {
            quizRepository.getQuizSetsFlow()
                .catch { err ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = err.localizedMessage ?: "Failed to load quiz sets"
                    )
                }
                .collect { sets ->
                    _uiState.value = _uiState.value.copy(isLoading = false, quizSets = sets)
                }
        }
    }

    private fun loadUserAttempts() {
        val user = authRepository.currentUser ?: return
        viewModelScope.launch {
            quizRepository.getUserAttemptsFlow(user.uid)
                .collect { attempts ->
                    _uiState.value = _uiState.value.copy(userAttempts = attempts)
                }
        }
    }

    fun startQuiz(quizSetId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, isQuizFinished = false, selectedAnswers = emptyMap(), currentQuestionIndex = 0)
            val res = quizRepository.getQuizSetById(quizSetId)
            res.fold(
                onSuccess = { qs ->
                    _uiState.value = _uiState.value.copy(isLoading = false, activeQuizSet = qs)
                },
                onFailure = { err ->
                    _uiState.value = _uiState.value.copy(isLoading = false, error = err.localizedMessage)
                }
            )
        }
    }

    fun selectOption(questionIndex: Int, optionIndex: Int) {
        val currentAnswers = _uiState.value.selectedAnswers.toMutableMap()
        currentAnswers[questionIndex] = optionIndex
        _uiState.value = _uiState.value.copy(selectedAnswers = currentAnswers)
    }

    fun nextQuestion() {
        val current = _uiState.value
        val qs = current.activeQuizSet ?: return
        if (current.currentQuestionIndex < qs.questions.size - 1) {
            _uiState.value = current.copy(currentQuestionIndex = current.currentQuestionIndex + 1)
        }
    }

    fun previousQuestion() {
        val current = _uiState.value
        if (current.currentQuestionIndex > 0) {
            _uiState.value = current.copy(currentQuestionIndex = current.currentQuestionIndex - 1)
        }
    }

    fun finishAndSubmitQuiz() {
        val current = _uiState.value
        val qs = current.activeQuizSet ?: return
        val questions = qs.questions
        if (questions.isEmpty()) return

        var correct = 0
        var incorrect = 0
        var unattempted = 0

        questions.forEachIndexed { index, question ->
            val selected = current.selectedAnswers[index]
            if (selected == null) {
                unattempted++
            } else if (selected == question.correctOption) {
                correct++
            } else {
                incorrect++
            }
        }

        // Lok Sewa Standard: +1 mark for correct, -0.20 for incorrect
        val negativeDeduction = incorrect * qs.negativeMarkRate
        val rawScore = correct.toDouble()
        val finalScore = (rawScore - negativeDeduction).coerceAtLeast(0.0)
        val percentage = (finalScore / questions.size) * 100.0
        val passed = percentage >= qs.passingPercentage

        val user = authRepository.currentUser
        val now = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(Date())

        val attempt = QuizAttempt(
            quizSetId = qs.id,
            quizTitle = qs.title,
            userId = user?.uid ?: "guest",
            userName = user?.displayName ?: (user?.email ?: "Candidate"),
            score = finalScore,
            correctCount = correct,
            incorrectCount = incorrect,
            unattemptedCount = unattempted,
            negativeMarksDeducted = negativeDeduction,
            totalQuestions = questions.size,
            percentage = percentage,
            passed = passed,
            timeTakenSeconds = 180,
            attemptedAt = now
        )

        viewModelScope.launch {
            if (user != null) {
                quizRepository.saveQuizAttempt(attempt)
            }
            _uiState.value = _uiState.value.copy(
                isQuizFinished = true,
                lastAttemptResult = attempt
            )
        }
    }
}
