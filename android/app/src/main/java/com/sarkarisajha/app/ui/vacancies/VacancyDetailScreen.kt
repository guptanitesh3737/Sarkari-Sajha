package com.sarkarisajha.app.ui.vacancies

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sarkarisajha.app.theme.Blue40
import com.sarkarisajha.app.theme.Emerald50
import com.sarkarisajha.app.theme.Emerald600
import com.sarkarisajha.app.theme.Rose50
import com.sarkarisajha.app.theme.Rose600
import com.sarkarisajha.app.theme.Slate100
import com.sarkarisajha.app.theme.Slate200
import com.sarkarisajha.app.theme.Slate500
import com.sarkarisajha.app.theme.Slate700
import com.sarkarisajha.app.theme.Slate900

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VacancyDetailScreen(
    vacancyId: String,
    vacanciesViewModel: VacanciesViewModel,
    onNavigateBack: () -> Unit
) {
    val uiState by vacanciesViewModel.uiState.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(vacancyId) {
        vacanciesViewModel.loadVacancyDetail(vacancyId)
    }

    val vacancy = uiState.selectedVacancy
    val isSaved = vacancy != null && uiState.savedVacancyIds.contains(vacancy.id)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Vacancy Details", style = MaterialTheme.typography.titleMedium) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    if (vacancy != null) {
                        IconButton(onClick = { vacanciesViewModel.toggleSaveVacancy(vacancy.id) }) {
                            Icon(
                                imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                                contentDescription = "Bookmark",
                                tint = if (isSaved) Blue40 else Slate500
                            )
                        }
                    }
                }
            )
        }
    ) { padding ->
        if (uiState.isLoadingDetail || vacancy == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Blue40)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Main Info Header Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Slate200),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(Slate100)
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = vacancy.category,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Slate700,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(Emerald50)
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = "Official Gazette Verified",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Emerald600,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = vacancy.displayTitle,
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )

                        Text(
                            text = vacancy.displayOrg,
                            style = MaterialTheme.typography.bodyLarge,
                            color = Slate500
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        // Key Specs Grid
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            SpecColumn(label = "Total Posts", value = "${vacancy.displayPosts} Seats")
                            SpecColumn(label = "Level", value = vacancy.jobLevel.ifBlank { "Level 5/7" })
                            SpecColumn(label = "Fee", value = "Rs. ${vacancy.displayFee.toInt()}")
                        }
                    }
                }

                // Important Dates Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Slate200),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Important Recruitment Deadlines",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        DateRow(
                            label = "Single Fee Deadline",
                            date = vacancy.displayDeadline,
                            highlight = true
                        )
                        vacancy.doubleFeeDeadline?.let { df ->
                            DateRow(label = "Double Fee Deadline", date = df)
                        }
                        vacancy.examDate?.let { ed ->
                            DateRow(label = "Scheduled Exam Date", date = ed)
                        }
                    }
                }

                // Eligibility & Requirements Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Slate200),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Minimum Eligibility Requirements",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        RequirementRow(
                            title = "Qualification",
                            desc = "${vacancy.qualification} in ${vacancy.requiredField}"
                        )
                        RequirementRow(
                            title = "Province / Region",
                            desc = vacancy.province
                        )
                        RequirementRow(
                            title = "Employment Status",
                            desc = vacancy.employmentType
                        )
                    }
                }

                // Official Apply & Notice Action Buttons
                val applyLink = vacancy.applyUrl ?: vacancy.officialSourceUrl
                if (applyLink.isNotBlank()) {
                    Button(
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(applyLink))
                            context.startActivity(intent)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Blue40)
                    ) {
                        Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Apply on Official Government Portal", fontWeight = FontWeight.Bold)
                    }
                }

                if (vacancy.officialSourceUrl.isNotBlank()) {
                    OutlinedButton(
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(vacancy.officialSourceUrl))
                            context.startActivity(intent)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.VerifiedUser, contentDescription = null, modifier = Modifier.size(16.dp), tint = Slate700)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("View Official Gazette Notice", color = Slate700, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

@Composable
private fun SpecColumn(label: String, value: String) {
    Column {
        Text(text = label, style = MaterialTheme.typography.bodySmall, color = Slate500)
        Text(text = value, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold, color = Slate900)
    }
}

@Composable
private fun DateRow(label: String, date: String, highlight: Boolean = false) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyMedium, color = Slate700)
        Text(
            text = date,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Bold,
            color = if (highlight) Rose600 else Slate900
        )
    }
}

@Composable
private fun RequirementRow(title: String, desc: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.Top
    ) {
        Icon(
            imageVector = Icons.Default.CheckCircle,
            contentDescription = null,
            modifier = Modifier
                .size(16.dp)
                .padding(top = 2.dp),
            tint = Emerald600
        )
        Spacer(modifier = Modifier.width(8.dp))
        Column {
            Text(text = title, style = MaterialTheme.typography.bodySmall, color = Slate500)
            Text(text = desc, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold, color = Slate900)
        }
    }
}
