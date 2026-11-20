package com.sarkarisajha.app.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sarkarisajha.app.model.UserProfile
import com.sarkarisajha.app.repository.AuthRepository
import com.sarkarisajha.app.repository.UserRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ProfileUiState(
    val isLoading: Boolean = true,
    val isSaving: Boolean = false,
    val profile: UserProfile? = null,
    val saveSuccess: Boolean = false,
    val error: String? = null
)

class ProfileViewModel(
    private val userRepository: UserRepository = UserRepository(),
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    init {
        loadProfile()
    }

    private fun loadProfile() {
        val user = authRepository.currentUser
        if (user == null) {
            _uiState.value = ProfileUiState(isLoading = false)
            return
        }

        viewModelScope.launch {
            userRepository.getUserProfileFlow(user.uid)
                .collect { p ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        profile = p ?: UserProfile(id = user.uid, email = user.email ?: "")
                    )
                }
        }
    }

    fun updateProfile(
        name: String,
        qualification: String,
        field: String,
        province: String,
        gender: String,
        isQuotaEligible: Boolean
    ) {
        val user = authRepository.currentUser ?: return
        val current = _uiState.value.profile ?: UserProfile(id = user.uid, email = user.email ?: "")

        val updated = current.copy(
            displayName = name,
            name = name,
            qualificationLevel = qualification,
            fieldOfStudy = field,
            province = province,
            gender = gender,
            isQuotaEligible = isQuotaEligible
        )

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true)
            val res = userRepository.saveUserProfile(updated)
            res.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(isSaving = false, saveSuccess = true, profile = updated)
                },
                onFailure = { err ->
                    _uiState.value = _uiState.value.copy(isSaving = false, error = err.localizedMessage)
                }
            )
        }
    }

    fun signOut() {
        authRepository.signOut()
    }
}
