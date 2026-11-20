package com.sarkarisajha.app.model

import com.google.firebase.firestore.PropertyName
import com.google.gson.annotations.SerializedName

data class StructuredQualification(
    val minLevel: String = "SEE/SLC",
    val fields: List<String> = emptyList(),
    val minAge: Int = 18,
    val maxAge: Int = 35
)

data class QuotaBreakdown(
    val open: Int = 0,
    val female: Int = 0,
    val janajati: Int = 0,
    val madhesi: Int = 0,
    val dalit: Int = 0,
    val apanga: Int = 0,
    val pichhadiye: Int = 0
)

data class Vacancy(
    val id: String = "",
    val slug: String = "",
    val title: String = "",
    val titleNp: String? = null,
    val organization: String = "",
    val org: String? = null,
    val department: String? = null,
    val position: String = "",
    @get:PropertyName("number_of_posts") @set:PropertyName("number_of_posts")
    var numberOfPosts: Int = 0,
    val posts: Int? = null,
    val province: String = "All Nepal",
    val district: String? = null,
    @get:PropertyName("job_level") @set:PropertyName("job_level")
    var jobLevel: String = "",
    val level: String? = null,
    @get:PropertyName("employment_type") @set:PropertyName("employment_type")
    var employmentType: String = "Permanent",
    val qualification: String = "SEE/SLC",
    @get:PropertyName("required_field") @set:PropertyName("required_field")
    var requiredField: String = "General",
    val category: String = "Lok Sewa (PSC)",
    @get:PropertyName("application_fee") @set:PropertyName("application_fee")
    var applicationFee: Double = 0.0,
    val fee: Double? = null,
    @get:PropertyName("application_deadline") @set:PropertyName("application_deadline")
    var applicationDeadline: String = "",
    val deadline: String? = null,
    val singleFeeDeadline: String? = null,
    val doubleFeeDeadline: String? = null,
    @get:PropertyName("exam_date") @set:PropertyName("exam_date")
    var examDate: String? = null,
    val salary: String? = null,
    @get:PropertyName("official_source_name") @set:PropertyName("official_source_name")
    var officialSourceName: String = "",
    @get:PropertyName("official_source_url") @set:PropertyName("official_source_url")
    var officialSourceUrl: String = "",
    val applyUrl: String? = null,
    val status: String = "published",
    val noticeNumber: String? = null,
    val description: String? = null,
    val syllabusSummary: List<String> = emptyList(),
    val viewsCount: Long = 0,
    val savesCount: Long = 0,
    val createdAt: String? = null,
    val updatedAt: String? = null
) {
    val displayOrg: String get() = if (organization.isNotBlank()) organization else org ?: "Government Entity"
    val displayTitle: String get() = if (title.isNotBlank()) title else position
    val displayDeadline: String get() = if (applicationDeadline.isNotBlank()) applicationDeadline else deadline ?: "Open"
    val displayFee: Double get() = if (applicationFee > 0) applicationFee else (fee ?: 0.0)
    val displayPosts: Int get() = if (numberOfPosts > 0) numberOfPosts else (posts ?: 1)
}
