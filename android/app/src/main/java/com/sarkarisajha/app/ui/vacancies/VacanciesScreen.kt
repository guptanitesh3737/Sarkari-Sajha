package com.sarkarisajha.app.ui.vacancies

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.sarkarisajha.app.theme.Blue40
import com.sarkarisajha.app.theme.Slate100
import com.sarkarisajha.app.theme.Slate200
import com.sarkarisajha.app.ui.components.EmptyStateView
import com.sarkarisajha.app.ui.components.VacancyCard

@Composable
fun VacanciesScreen(
    vacanciesViewModel: VacanciesViewModel,
    onNavigateToDetail: (String) -> Unit
) {
    val uiState by vacanciesViewModel.uiState.collectAsState()

    val categories = listOf("All", "Lok Sewa (PSC)", "Teacher Service (TSC)", "Banking & Finance", "Security Forces", "Health Services")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Search Input
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = { vacanciesViewModel.onSearchQueryChanged(it) },
                label = { Text("Search position, ministry or organization...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                trailingIcon = {
                    if (uiState.searchQuery.isNotEmpty()) {
                        IconButton(onClick = { vacanciesViewModel.onSearchQueryChanged("") }) {
                            Icon(Icons.Default.Close, contentDescription = "Clear")
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(10.dp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Category Chips Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                categories.forEach { cat ->
                    val isSelected = uiState.selectedCategory == cat
                    FilterChip(
                        selected = isSelected,
                        onClick = { vacanciesViewModel.onCategoryFilterChanged(cat) },
                        label = { Text(cat, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Blue40,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                        )
                    )
                }
            }
        }

        // Vacancy List or Loading
        if (uiState.isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Blue40)
            }
        } else if (uiState.filteredVacancies.isEmpty()) {
            EmptyStateView(
                title = "No Vacancies Found",
                message = "Try changing your search terms or filters."
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                item {
                    Text(
                        text = "Showing ${uiState.filteredVacancies.size} Active Openings",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }

                items(uiState.filteredVacancies, key = { it.id }) { vacancy ->
                    val isSaved = uiState.savedVacancyIds.contains(vacancy.id)
                    VacancyCard(
                        vacancy = vacancy,
                        isSaved = isSaved,
                        onCardClick = { onNavigateToDetail(vacancy.id) },
                        onBookmarkClick = { vacanciesViewModel.toggleSaveVacancy(vacancy.id) }
                    )
                }
            }
        }
    }
}
