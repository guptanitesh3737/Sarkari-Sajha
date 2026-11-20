package com.sarkarisajha.app.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sarkarisajha.app.model.ApplicationTrack
import com.sarkarisajha.app.model.QuizAttempt
import com.sarkarisajha.app.model.UserProfile
import com.sarkarisajha.app.model.Vacancy
import com.sarkarisajha.app.repository.AuthRepository
import com.sarkarisajha.app.repository.QuizRepository
import com.sarkarisajha.app.repository.UserRepository
import com.sarkarisajha.app.repository.VacancyRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

data class DashboardUiState(
    val isLoading: Boolean = true,
    val userProfile: UserProfile? = null,
    val savedVacanciesCount: Int = 0,
    val applications: List<ApplicationTrack> = emptyList(),
    val quizAttempts: List<QuizAttempt> = emptyList(),
    val averageScore: Double = 0.0,
    val matchedVacancies: List<Vacancy> = emptyList(),
    val error: String? = null
)

class DashboardViewModel(
    private val userRepository: UserRepository = UserRepository(),
    private val quizRepository: QuizRepository = QuizRepository(),
    private val vacancyRepository: VacancyRepository = VacancyRepository(),
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadDashboardData()
    }

    private fun loadDashboardData() {
        val user = authRepository.currentUser
        if (user == null) {
            _uiState.value = DashboardUiState(isLoading = false)
            return
        }

        viewModelScope.launch {
            combine(
                userRepository.getUserProfileFlow(user.uid),
                userRepository.getSavedVacanciesFlow(user.uid),
                userRepository.getApplicationTracksFlow(user.uid),
                quizRepository.getUserAttemptsFlow(user.uid),
                vacancyRepository.getPublishedVacanciesFlow()
            ) { profile, saved, apps, attempts, allVacancies ->
                val avg = if (attempts.isNotEmpty()) {
                    attempts.map { it.percentage }.average()
                } else 0.0

                // Compute matches based on user's qualification and target categories
                val matches = if (profile != null) {
                    allVacancies.filter { v ->
                        val qualMatch = profile.qualificationLevel.isBlank() || profile.qualificationLevel == "Any" || v.qualification.contains(profile.qualificationLevel, ignoreCase = true)
                        val catMatch = profile.targetCategories.isEmpty() || profile.targetCategories.any { tc -> v.category.contains(tc, ignoreCase = true) }
                        qualMatch || catMatch
                    }.take(4)
                } else emptyList()

                DashboardUiState(
                    isLoading = false,
                    userProfile = profile ?: UserProfile(id = user.uid, email = user.email ?: ""),
                    savedVacanciesCount = saved.size,
                    applications = apps,
                    quizAttempts = attempts,
                    averageScore = avg,
                    matchedVacancies = matches
                )
            }.collect { newState ->
                _uiState.value = newState
            }
        }
    }
}
