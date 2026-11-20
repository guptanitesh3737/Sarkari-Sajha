package com.sarkarisajha.app.ui.vacancies

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sarkarisajha.app.model.Vacancy
import com.sarkarisajha.app.repository.AuthRepository
import com.sarkarisajha.app.repository.UserRepository
import com.sarkarisajha.app.repository.VacancyRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

data class VacanciesUiState(
    val isLoading: Boolean = true,
    val allVacancies: List<Vacancy> = emptyList(),
    val filteredVacancies: List<Vacancy> = emptyList(),
    val savedVacancyIds: Set<String> = emptySet(),
    val searchQuery: String = "",
    val selectedCategory: String = "All",
    val selectedProvince: String = "All",
    val selectedQualification: String = "All",
    val selectedVacancy: Vacancy? = null,
    val isLoadingDetail: Boolean = false,
    val error: String? = null
)

class VacanciesViewModel(
    private val vacancyRepository: VacancyRepository = VacancyRepository(),
    private val userRepository: UserRepository = UserRepository(),
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(VacanciesUiState())
    val uiState: StateFlow<VacanciesUiState> = _uiState.asStateFlow()

    init {
        loadVacancies()
    }

    private fun loadVacancies() {
        val currentUserId = authRepository.currentUser?.uid ?: ""

        viewModelScope.launch {
            combine(
                vacancyRepository.getPublishedVacanciesFlow(),
                userRepository.getSavedVacanciesFlow(currentUserId)
            ) { vacanciesList, savedItems ->
                val savedIds = savedItems.map { it.vacancyId }.toSet()
                val current = _uiState.value
                val filtered = applyFilters(
                    vacanciesList,
                    current.searchQuery,
                    current.selectedCategory,
                    current.selectedProvince,
                    current.selectedQualification
                )

                current.copy(
                    isLoading = false,
                    allVacancies = vacanciesList,
                    filteredVacancies = filtered,
                    savedVacancyIds = savedIds
                )
            }.collect { newState ->
                _uiState.value = newState
            }
        }
    }

    fun onSearchQueryChanged(query: String) {
        val current = _uiState.value
        val filtered = applyFilters(
            current.allVacancies,
            query,
            current.selectedCategory,
            current.selectedProvince,
            current.selectedQualification
        )
        _uiState.value = current.copy(searchQuery = query, filteredVacancies = filtered)
    }

    fun onCategoryFilterChanged(category: String) {
        val current = _uiState.value
        val filtered = applyFilters(
            current.allVacancies,
            current.searchQuery,
            category,
            current.selectedProvince,
            current.selectedQualification
        )
        _uiState.value = current.copy(selectedCategory = category, filteredVacancies = filtered)
    }

    fun onProvinceFilterChanged(province: String) {
        val current = _uiState.value
        val filtered = applyFilters(
            current.allVacancies,
            current.searchQuery,
            current.selectedCategory,
            province,
            current.selectedQualification
        )
        _uiState.value = current.copy(selectedProvince = province, filteredVacancies = filtered)
    }

    fun onQualificationFilterChanged(qualification: String) {
        val current = _uiState.value
        val filtered = applyFilters(
            current.allVacancies,
            current.searchQuery,
            current.selectedCategory,
            current.selectedProvince,
            qualification
        )
        _uiState.value = current.copy(selectedQualification = qualification, filteredVacancies = filtered)
    }

    private fun applyFilters(
        list: List<Vacancy>,
        search: String,
        category: String,
        province: String,
        qualification: String
    ): List<Vacancy> {
        return list.filter { v ->
            val matchesSearch = search.isBlank() ||
                    v.title.contains(search, ignoreCase = true) ||
                    v.organization.contains(search, ignoreCase = true) ||
                    v.position.contains(search, ignoreCase = true)

            val matchesCategory = category == "All" || v.category.equals(category, ignoreCase = true)
            val matchesProvince = province == "All" || v.province.equals(province, ignoreCase = true) || v.province == "All Nepal"
            val matchesQual = qualification == "All" || v.qualification.equals(qualification, ignoreCase = true)

            matchesSearch && matchesCategory && matchesProvince && matchesQual
        }
    }

    fun loadVacancyDetail(id: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingDetail = true, error = null)
            val res = vacancyRepository.getVacancyById(id)
            res.fold(
                onSuccess = { v ->
                    _uiState.value = _uiState.value.copy(isLoadingDetail = false, selectedVacancy = v)
                },
                onFailure = { err ->
                    _uiState.value = _uiState.value.copy(
                        isLoadingDetail = false,
                        error = err.localizedMessage ?: "Failed to load vacancy details"
                    )
                }
            )
        }
    }

    fun toggleSaveVacancy(vacancyId: String) {
        val user = authRepository.currentUser ?: return
        viewModelScope.launch {
            userRepository.toggleSaveVacancy(user.uid, vacancyId)
        }
    }
}
