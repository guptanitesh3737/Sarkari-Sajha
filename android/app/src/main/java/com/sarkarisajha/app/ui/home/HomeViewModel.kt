package com.sarkarisajha.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sarkarisajha.app.model.QuizSet
import com.sarkarisajha.app.model.Vacancy
import com.sarkarisajha.app.repository.AuthRepository
import com.sarkarisajha.app.repository.QuizRepository
import com.sarkarisajha.app.repository.UserRepository
import com.sarkarisajha.app.repository.VacancyRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean = true,
    val vacancies: List<Vacancy> = emptyList(),
    val trendingVacancies: List<Vacancy> = emptyList(),
    val savedVacancyIds: Set<String> = emptySet(),
    val dailyQuiz: QuizSet? = null,
    val error: String? = null
)

class HomeViewModel(
    private val vacancyRepository: VacancyRepository = VacancyRepository(),
    private val quizRepository: QuizRepository = QuizRepository(),
    private val userRepository: UserRepository = UserRepository(),
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadHomeData()
    }

    private fun loadHomeData() {
        val currentUserId = authRepository.currentUser?.uid ?: ""

        viewModelScope.launch {
            combine(
                vacancyRepository.getPublishedVacanciesFlow(),
                quizRepository.getQuizSetsFlow(),
                userRepository.getSavedVacanciesFlow(currentUserId)
            ) { vacanciesList, quizList, savedItems ->
                val savedIds = savedItems.map { it.vacancyId }.toSet()
                val trending = vacanciesList.sortedByDescending { it.viewsCount }.take(5)
                val daily = quizList.firstOrNull()

                HomeUiState(
                    isLoading = false,
                    vacancies = vacanciesList,
                    trendingVacancies = trending,
                    savedVacancyIds = savedIds,
                    dailyQuiz = daily,
                    error = null
                )
            }.catch { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.localizedMessage ?: "Failed to load home data"
                )
            }.collect { state ->
                _uiState.value = state
            }
        }
    }

    fun toggleSaveVacancy(vacancyId: String) {
        val user = authRepository.currentUser ?: return
        viewModelScope.launch {
            userRepository.toggleSaveVacancy(user.uid, vacancyId)
        }
    }
}
