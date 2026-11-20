package com.sarkarisajha.app.model

data class NotificationPreferences(
    val email: Boolean = true,
    val sms: Boolean = false,
    val push: Boolean = true,
    val frequency: String = "instant"
)

data class JobAlertPreferences(
    val enabled: Boolean = true,
    val qualification: String = "All",
    val interestedFields: List<String> = emptyList(),
    val province: String = "All Nepal",
    val district: String = "All Districts",
    val jobLevel: String = "All Levels",
    val organizations: List<String> = emptyList(),
    val subjects: List<String> = emptyList()
)

data class UserProfile(
    val id: String = "",
    val name: String = "",
    val email: String = "",
    val phone: String = "",
    val qualificationLevel: String = "SEE/SLC",
    val fieldOfStudy: String = "General",
    val province: String = "All Nepal",
    val age: Int = 22,
    val preferredCategories: List<String> = emptyList(),
    val notificationPrefs: NotificationPreferences = NotificationPreferences(),
    val jobAlertPreferences: JobAlertPreferences? = null,
    val resumeText: String? = null
)
