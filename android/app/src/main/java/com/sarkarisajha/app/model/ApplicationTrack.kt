package com.sarkarisajha.app.model

data class ApplicationTrack(
    val id: String = "",
    val vacancyId: String = "",
    val status: String = "Bookmarked",
    val appliedAt: String = "",
    val notes: String? = null,
    val feePaid: Boolean = false,
    val deadlineReminderDate: String? = null
)

data class SavedVacancyItem(
    val id: String = "",
    val userId: String = "",
    val vacancyId: String = "",
    val savedAt: String = "",
    val notes: String? = null
)
