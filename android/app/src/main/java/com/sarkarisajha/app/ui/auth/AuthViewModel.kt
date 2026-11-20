package com.sarkarisajha.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseUser
import com.sarkarisajha.app.model.UserProfile
import com.sarkarisajha.app.repository.AuthRepository
import com.sarkarisajha.app.repository.UserRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val user: FirebaseUser? = null,
    val error: String? = null,
    val isSuccess: Boolean = false
)

class AuthViewModel(
    private val authRepository: AuthRepository = AuthRepository(),
    private val userRepository: UserRepository = UserRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.authState.collect { firebaseUser ->
                _uiState.value = _uiState.value.copy(user = firebaseUser)
            }
        }
    }

    fun signIn(email: String, pass: String) {
        if (email.isBlank() || pass.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Please enter both email and password")
            return
        }
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val res = authRepository.signInWithEmail(email, pass)
            res.fold(
                onSuccess = { user ->
                    _uiState.value = _uiState.value.copy(isLoading = false, user = user, isSuccess = true)
                },
                onFailure = { err ->
                    _uiState.value = _uiState.value.copy(isLoading = false, error = err.localizedMessage ?: "Sign in failed")
                }
            )
        }
    }

    fun register(name: String, email: String, pass: String) {
        if (email.isBlank() || pass.isBlank() || name.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Please fill in all fields")
            return
        }
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val res = authRepository.registerWithEmail(email, pass)
            res.fold(
                onSuccess = { user ->
                    // Initialize base profile in Firestore
                    val newProfile = UserProfile(
                        id = user.uid,
                        name = name.trim(),
                        email = email.trim()
                    )
                    userRepository.saveUserProfile(newProfile)
                    _uiState.value = _uiState.value.copy(isLoading = false, user = user, isSuccess = true)
                },
                onFailure = { err ->
                    _uiState.value = _uiState.value.copy(isLoading = false, error = err.localizedMessage ?: "Registration failed")
                }
            )
        }
    }

    fun signOut() {
        authRepository.signOut()
        _uiState.value = AuthUiState()
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
