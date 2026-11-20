package com.sarkarisajha.app.network

import com.google.gson.annotations.SerializedName
import com.sarkarisajha.app.model.UserProfile
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

data class AiAssistantRequest(
    val query: String,
    val userProfile: UserProfile? = null,
    val conversationHistory: List<Map<String, String>> = emptyList()
)

data class AiAssistantDatabaseMatch(
    val id: String,
    val title: String,
    val org: String,
    val deadline: String,
    val category: String,
    val qualification: String,
    val salary: String? = null,
    val quotaCount: Int = 1,
    val whyRelevant: String? = null
)

data class AiOfficialSourceInfo(
    val topic: String = "",
    val rules: List<String> = emptyList(),
    val officialReference: String = ""
)

data class AiRecommendation(
    val title: String = "",
    val points: List<String> = emptyList(),
    val recommendedQuizId: String? = null,
    val recommendedQuizTitle: String? = null
)

data class AiGeneralGuidance(
    val studyTips: List<String> = emptyList()
)

data class AiAssistantResponse(
    val replySummary: String = "",
    val replySummaryNp: String? = null,
    val queryIntent: String = "general_query",
    val databaseMatches: List<AiAssistantDatabaseMatch> = emptyList(),
    val officialSourceInfo: List<AiOfficialSourceInfo> = emptyList(),
    val aiRecommendations: List<AiRecommendation> = emptyList(),
    val generalGuidance: AiGeneralGuidance? = null,
    val suggestedNextQuestions: List<String> = emptyList(),
    val disclaimer: String = ""
)

interface ApiService {
    @POST("api/ai/assistant-chat")
    suspend fun sendAiChatQuery(@Body request: AiAssistantRequest): AiAssistantResponse

    companion object {
        private const val BASE_URL = "https://sarkarisajha.gov.np/" // Configurable or local backend proxy

        fun create(baseUrl: String = BASE_URL): ApiService {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }
            val client = OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .addInterceptor(logging)
                .build()

            return Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ApiService::class.java)
        }
    }
}
