package com.sarkarisajha.app.ui.home

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Quiz
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Work
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sarkarisajha.app.theme.Amber40
import com.sarkarisajha.app.theme.Amber50
import com.sarkarisajha.app.theme.Amber500
import com.sarkarisajha.app.theme.Blue40
import com.sarkarisajha.app.theme.Emerald50
import com.sarkarisajha.app.theme.Emerald600
import com.sarkarisajha.app.theme.Navy900
import com.sarkarisajha.app.theme.Navy950
import com.sarkarisajha.app.theme.Slate200
import com.sarkarisajha.app.theme.Slate500
import com.sarkarisajha.app.theme.Slate700
import com.sarkarisajha.app.ui.components.VacancyCard

@Composable
fun HomeScreen(
    homeViewModel: HomeViewModel,
    onNavigateToVacancyDetail: (String) -> Unit,
    onNavigateToVacancies: () -> Unit,
    onNavigateToQuiz: (String) -> Unit,
    onNavigateToAiAssistant: () -> Unit
) {
    val uiState by homeViewModel.uiState.collectAsState()

    if (uiState.isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = Blue40)
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
        // Hero / AI Banner
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
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(Amber500.copy(alpha = 0.2f))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "Lok Sewa & PSC Hub",
                                style = MaterialTheme.typography.labelSmall,
                                color = Amber40,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            tint = Color.White.copy(alpha = 0.7f),
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Verified Government Vacancies & Lok Sewa MCQs",
                        style = MaterialTheme.typography.titleLarge.copy(
                            color = Color.White,
                            fontSize = 19.sp
                        )
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Instant quota matching, negative marking quiz engine & official gazette alerts.",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = Color.White.copy(alpha = 0.8f)
                        )
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = onNavigateToAiAssistant,
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Blue40)
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = "Ask AI Career Guide", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Daily Mock Test Banner
        uiState.dailyQuiz?.let { daily ->
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigateToQuiz(daily.id) },
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Slate200),
                    colors = CardDefaults.cardColors(containerColor = Emerald50)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "🎯 Daily Mock Test",
                                style = MaterialTheme.typography.titleMedium,
                                color = Emerald600,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = daily.title,
                                style = MaterialTheme.typography.bodyMedium,
                                color = Slate700,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "${daily.totalQuestions} Questions • ${daily.timeLimitMinutes} Mins • -20% Negative Marking",
                                style = MaterialTheme.typography.bodySmall,
                                color = Slate500
                            )
                        }

                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Emerald600),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = "Start",
                                tint = Color.White
                            )
                        }
                    }
                }
            }
        }

        // Section: Latest Verified Openings Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Latest Verified Vacancies",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                TextButton(onClick = onNavigateToVacancies) {
                    Text(text = "View All (${uiState.vacancies.size})", color = Blue40, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.Default.ArrowForward,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = Blue40
                    )
                }
            }
        }

        // Vacancy List
        items(uiState.vacancies.take(6), key = { it.id }) { vacancy ->
            val isSaved = uiState.savedVacancyIds.contains(vacancy.id)
            VacancyCard(
                vacancy = vacancy,
                isSaved = isSaved,
                onCardClick = { onNavigateToVacancyDetail(vacancy.id) },
                onBookmarkClick = { homeViewModel.toggleSaveVacancy(vacancy.id) }
            )
        }
    }
}
