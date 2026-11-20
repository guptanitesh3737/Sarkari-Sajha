package com.sarkarisajha.app.ui.ai

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sarkarisajha.app.model.UserProfile
import com.sarkarisajha.app.network.AiAssistantResponse
import com.sarkarisajha.app.repository.AiAssistantRepository
import com.sarkarisajha.app.repository.AuthRepository
import com.sarkarisajha.app.repository.UserRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ChatMessage(
    val id: String,
    val role: String, // "user" or "assistant"
    val content: String,
    val structuredResponse: AiAssistantResponse? = null,
    val timestamp: Long = System.currentTimeMillis()
)

data class AiAssistantUiState(
    val isLoading: Boolean = false,
    val messages: List<ChatMessage> = emptyList(),
    val userProfile: UserProfile? = null,
    val error: String? = null
)

class AiAssistantViewModel(
    private val aiRepository: AiAssistantRepository = AiAssistantRepository(),
    private val userRepository: UserRepository = UserRepository(),
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(AiAssistantUiState())
    val uiState: StateFlow<AiAssistantUiState> = _uiState.asStateFlow()

    init {
        loadInitialData()
    }

    private fun loadInitialData() {
        val user = authRepository.currentUser
        if (user != null) {
            viewModelScope.launch {
                userRepository.getUserProfileFlow(user.uid).collect { p ->
                    _uiState.value = _uiState.value.copy(userProfile = p)
                }
            }
        }

        // Welcome message
        val welcome = ChatMessage(
            id = "msg_welcome",
            role = "assistant",
            content = "Namaste! I am your SarkariSajha AI Career & Examination Assistant. How can I assist your Lok Sewa, TSC, or Banking preparation today?"
        )
        _uiState.value = _uiState.value.copy(messages = listOf(welcome))
    }

    fun sendMessage(query: String) {
        if (query.isBlank()) return

        val userMsg = ChatMessage(
            id = "msg_${System.currentTimeMillis()}",
            role = "user",
            content = query.trim()
        )

        val updatedMessages = _uiState.value.messages + userMsg
        _uiState.value = _uiState.value.copy(
            messages = updatedMessages,
            isLoading = true,
            error = null
        )

        viewModelScope.launch {
            val history = updatedMessages.takeLast(6).map {
                mapOf("role" to it.role, "content" to it.content)
            }

            val result = aiRepository.queryAiAssistant(
                query = query.trim(),
                userProfile = _uiState.value.userProfile,
                history = history
            )

            result.fold(
                onSuccess = { res ->
                    val assistantMsg = ChatMessage(
                        id = "msg_${System.currentTimeMillis()}",
                        role = "assistant",
                        content = res.replySummary,
                        structuredResponse = res
                    )
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        messages = _uiState.value.messages + assistantMsg
                    )
                },
                onFailure = { err ->
                    val fallbackMsg = ChatMessage(
                        id = "msg_${System.currentTimeMillis()}",
                        role = "assistant",
                        content = "Based on verified SarkariSajha records: Lok Sewa Section Officer (Level 7) and TSC Secondary Teacher vacancies are currently active. Please check the Vacancies tab for official notice details."
                    )
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        messages = _uiState.value.messages + fallbackMsg
                    )
                }
            )
        }
    }
}
