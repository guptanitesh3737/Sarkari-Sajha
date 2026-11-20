package com.sarkarisajha.app.model

data class NotificationItem(
    val id: String = "",
    val title: String = "",
    val titleNp: String? = null,
    val message: String = "",
    val messageNp: String? = null,
    val type: String = "vacancy_alert",
    val priority: String = "normal",
    val vacancyId: String? = null,
    val quizSetId: String? = null,
    val isRead: Boolean = false,
    val createdAt: String = ""
)
