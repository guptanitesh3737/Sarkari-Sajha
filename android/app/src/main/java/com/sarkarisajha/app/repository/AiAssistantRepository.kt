package com.sarkarisajha.app.repository

import com.sarkarisajha.app.model.UserProfile
import com.sarkarisajha.app.network.AiAssistantRequest
import com.sarkarisajha.app.network.AiAssistantResponse
import com.sarkarisajha.app.network.ApiService

class AiAssistantRepository(
    private val apiService: ApiService = ApiService.create()
) {
    suspend fun queryAiAssistant(
        query: String,
        userProfile: UserProfile?,
        history: List<Map<String, String>>
    ): Result<AiAssistantResponse> {
        return try {
            val response = apiService.sendAiChatQuery(
                AiAssistantRequest(
                    query = query,
                    userProfile = userProfile,
                    conversationHistory = history
                )
            )
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
