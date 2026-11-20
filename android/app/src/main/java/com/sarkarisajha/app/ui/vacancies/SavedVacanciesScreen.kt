package com.sarkarisajha.app.ui.vacancies

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.sarkarisajha.app.theme.Blue40
import com.sarkarisajha.app.ui.components.EmptyStateView
import com.sarkarisajha.app.ui.components.VacancyCard

@Composable
fun SavedVacanciesScreen(
    vacanciesViewModel: VacanciesViewModel,
    onNavigateToDetail: (String) -> Unit
) {
    val uiState by vacanciesViewModel.uiState.collectAsState()

    val savedVacancies = uiState.allVacancies.filter { uiState.savedVacancyIds.contains(it.id) }

    if (uiState.isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = Blue40)
        }
    } else if (savedVacancies.isEmpty()) {
        EmptyStateView(
            title = "No Bookmarked Vacancies",
            message = "Tap the bookmark icon on any vacancy card to save it for offline tracking.",
            icon = Icons.Default.BookmarkBorder
        )
    } else {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Text(
                    text = "Saved Vacancies (${savedVacancies.size})",
                    style = MaterialTheme.typography.titleMedium
                )
            }

            items(savedVacancies, key = { it.id }) { vacancy ->
                VacancyCard(
                    vacancy = vacancy,
                    isSaved = true,
                    onCardClick = { onNavigateToDetail(vacancy.id) },
                    onBookmarkClick = { vacanciesViewModel.toggleSaveVacancy(vacancy.id) }
                )
            }
        }
    }
}
