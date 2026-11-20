package com.sarkarisajha.app.ui.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sarkarisajha.app.model.NotificationItem
import com.sarkarisajha.app.repository.AuthRepository
import com.sarkarisajha.app.repository.NotificationRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch

data class NotificationsUiState(
    val isLoading: Boolean = true,
    val notifications: List<NotificationItem> = emptyList(),
    val error: String? = null
)

class NotificationsViewModel(
    private val notificationRepository: NotificationRepository = NotificationRepository(),
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(NotificationsUiState())
    val uiState: StateFlow<NotificationsUiState> = _uiState.asStateFlow()

    init {
        loadNotifications()
    }

    private fun loadNotifications() {
        val user = authRepository.currentUser
        val userId = user?.uid ?: "guest"

        viewModelScope.launch {
            notificationRepository.getUserNotificationsFlow(userId)
                .catch { err ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = err.localizedMessage
                    )
                }
                .collect { list ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        notifications = list
                    )
                }
        }
    }

    fun markAsRead(notificationId: String) {
        viewModelScope.launch {
            notificationRepository.markNotificationAsRead(notificationId)
        }
    }
}
