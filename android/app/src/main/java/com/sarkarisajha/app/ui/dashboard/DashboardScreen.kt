package com.sarkarisajha.app.ui.dashboard

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sarkarisajha.app.theme.Amber500
import com.sarkarisajha.app.theme.Blue40
import com.sarkarisajha.app.theme.Emerald50
import com.sarkarisajha.app.theme.Emerald600
import com.sarkarisajha.app.theme.Navy900
import com.sarkarisajha.app.theme.Rose600
import com.sarkarisajha.app.theme.Slate200
import com.sarkarisajha.app.theme.Slate500
import com.sarkarisajha.app.theme.Slate700
import com.sarkarisajha.app.theme.Slate900

@Composable
fun DashboardScreen(
    dashboardViewModel: DashboardViewModel,
    onNavigateToLogin: () -> Unit,
    onNavigateToSavedVacancies: () -> Unit,
    onNavigateToProfile: () -> Unit,
    onNavigateToVacancyDetail: (String) -> Unit
) {
    val uiState by dashboardViewModel.uiState.collectAsState()

    if (uiState.isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = Blue40)
        }
        return
    }

    val profile = uiState.userProfile
    if (profile == null) {
        // Guest mode prompt
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(64.dp), tint = Slate500)
            Spacer(modifier = Modifier.height(16.dp))
            Text("Candidate Portal", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text(
                "Sign in with your SarkariSajha account to synchronize your mock test results, application timeline, and saved vacancies.",
                style = MaterialTheme.typography.bodyMedium,
                color = Slate500,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
            Spacer(modifier = Modifier.height(24.dp))
            Button(
                onClick = onNavigateToLogin,
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Blue40)
            ) {
                Text("Sign In / Register", fontWeight = FontWeight.Bold)
            }
        }
        return
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // User Profile Summary Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Navy900)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = profile.displayName.ifBlank { "Candidate Profile" },
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = profile.email,
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.White.copy(alpha = 0.75f)
                            )
                        }

                        TextButton(onClick = onNavigateToProfile) {
                            Text("Edit Profile", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        ProfilePill(
                            label = "Qualification",
                            value = profile.qualificationLevel.ifBlank { "Bachelor's" }
                        )
                        ProfilePill(
                            label = "Field",
                            value = profile.fieldOfStudy.ifBlank { "General" }
                        )
                        ProfilePill(
                            label = "Province",
                            value = profile.province.ifBlank { "Bagmati" }
                        )
                    }
                }
            }
        }

        // Analytics Counter Grid
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                DashboardMetricCard(
                    title = "Saved Jobs",
                    count = "${uiState.savedVacanciesCount}",
                    icon = Icons.Default.Bookmark,
                    tint = Blue40,
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigateToSavedVacancies() }
                )
                DashboardMetricCard(
                    title = "MCQ Score",
                    count = "${String.format("%.1f", uiState.averageScore)}%",
                    icon = Icons.Default.EmojiEvents,
                    tint = Amber500,
                    modifier = Modifier.weight(1f)
                )
                DashboardMetricCard(
                    title = "Tests Taken",
                    count = "${uiState.quizAttempts.size}",
                    icon = Icons.Default.CheckCircle,
                    tint = Emerald600,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Recent Mock Test Attempts
        item {
            Text(
                text = "Recent Exam Attempts & Scores",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }

        if (uiState.quizAttempts.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, Slate200),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Text(
                        text = "You haven't attempted any mock tests yet. Head over to the Quiz tab to test your preparation!",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate500,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        } else {
            items(uiState.quizAttempts.take(4)) { att ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, Slate200),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = att.quizTitle.ifBlank { "Lok Sewa Simulation" },
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${att.attemptedAt} • ${att.correctCount} Correct / ${att.incorrectCount} Wrong",
                                style = MaterialTheme.typography.bodySmall,
                                color = Slate500
                            )
                        }

                        Text(
                            text = "${String.format("%.1f", att.score)} / ${att.totalQuestions}",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = if (att.passed) Emerald600 else Rose600
                        )
                    }
                }
            }
        }

        // Matched Vacancies Section
        if (uiState.matchedVacancies.isNotEmpty()) {
            item {
                Text(
                    text = "AI Matched Openings for Your Profile",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            items(uiState.matchedVacancies) { vacancy ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigateToVacancyDetail(vacancy.id) },
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, Slate200),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = vacancy.displayTitle,
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${vacancy.displayOrg} • ${vacancy.qualification}",
                                style = MaterialTheme.typography.bodySmall,
                                color = Slate500
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(Emerald50)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "92% Match",
                                style = MaterialTheme.typography.labelSmall,
                                color = Emerald600,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ProfilePill(label: String, value: String) {
    Column {
        Text(text = label, style = MaterialTheme.typography.labelSmall, color = Color.White.copy(alpha = 0.6f))
        Text(text = value, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold, color = Color.White)
    }
}

@Composable
private fun DashboardMetricCard(
    title: String,
    count: String,
    icon: ImageVector,
    tint: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, Slate200),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.Start
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = tint, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.height(6.dp))
            Text(text = count, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Slate900)
            Text(text = title, style = MaterialTheme.typography.bodySmall, color = Slate500)
        }
    }
}
