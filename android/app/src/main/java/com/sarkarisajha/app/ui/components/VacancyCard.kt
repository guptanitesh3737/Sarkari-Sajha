package com.sarkarisajha.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.sarkarisajha.app.model.Vacancy
import com.sarkarisajha.app.theme.Amber50
import com.sarkarisajha.app.theme.Amber500
import com.sarkarisajha.app.theme.Blue40
import com.sarkarisajha.app.theme.Emerald50
import com.sarkarisajha.app.theme.Emerald600
import com.sarkarisajha.app.theme.Rose50
import com.sarkarisajha.app.theme.Rose600
import com.sarkarisajha.app.theme.Slate100
import com.sarkarisajha.app.theme.Slate200
import com.sarkarisajha.app.theme.Slate500
import com.sarkarisajha.app.theme.Slate700

@Composable
fun VacancyCard(
    vacancy: Vacancy,
    isSaved: Boolean = false,
    onCardClick: () -> Unit,
    onBookmarkClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCardClick() },
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, Slate200),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    // Category & Verified Badge
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(Slate100)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = vacancy.category,
                                style = MaterialTheme.typography.labelSmall,
                                color = Slate700,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(Emerald50)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "Verified",
                                style = MaterialTheme.typography.labelSmall,
                                color = Emerald600,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = vacancy.displayTitle,
                        style = MaterialTheme.typography.titleMedium,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = vacancy.displayOrg,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate500,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                IconButton(
                    onClick = onBookmarkClick,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                        contentDescription = "Bookmark",
                        tint = if (isSaved) Blue40 else Slate500
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Metadata Chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Posts
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "${vacancy.displayPosts} Posts",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = Blue40
                    )
                }

                // Qualification
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.School,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = Slate500
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = vacancy.qualification,
                        style = MaterialTheme.typography.bodySmall,
                        color = Slate700
                    )
                }

                // Province
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = Slate500
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = vacancy.province,
                        style = MaterialTheme.typography.bodySmall,
                        color = Slate700
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Deadline
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.CalendarToday,
                        contentDescription = null,
                        modifier = Modifier.size(13.dp),
                        tint = Rose600
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Deadline: ${vacancy.displayDeadline}",
                        style = MaterialTheme.typography.bodySmall,
                        color = Rose600,
                        fontWeight = FontWeight.Medium
                    )
                }

                Text(
                    text = "Rs. ${vacancy.displayFee.toInt()}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate700,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}
