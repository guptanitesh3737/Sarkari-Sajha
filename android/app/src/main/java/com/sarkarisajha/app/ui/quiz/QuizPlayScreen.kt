package com.sarkarisajha.app.ui.quiz

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
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
fun QuizPlayScreen(
    quizSetId: String,
    quizViewModel: QuizViewModel,
    onNavigateBack: () -> Unit
) {
    val uiState by quizViewModel.uiState.collectAsState()

    LaunchedEffect(quizSetId) {
        quizViewModel.startQuiz(quizSetId)
    }

    val qs = uiState.activeQuizSet

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(qs?.title ?: "Quiz Simulation", style = MaterialTheme.typography.titleMedium) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Exit")
                    }
                }
            )
        }
    ) { padding ->
        if (uiState.isLoading || qs == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Blue40)
            }
        } else if (uiState.isQuizFinished) {
            // Result View
            val result = uiState.lastAttemptResult
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Default.EmojiEvents,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = if (result?.passed == true) Emerald600 else Rose600
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = if (result?.passed == true) "Congratulations! Exam Passed" else "Needs Improvement",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (result?.passed == true) Emerald600 else Rose600
                )
                Text(
                    text = "Score synchronized to your candidate dashboard.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate500
                )

                Spacer(modifier = Modifier.height(24.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Slate200),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Total Questions", style = MaterialTheme.typography.bodyMedium, color = Slate500)
                            Text("${result?.totalQuestions}", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Correct Answers (+1.00)", style = MaterialTheme.typography.bodyMedium, color = Emerald600)
                            Text("${result?.correctCount}", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = Emerald600)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Wrong Answers (-${String.format("%.2f", result?.negativeMarksDeducted ?: 0.0)})", style = MaterialTheme.typography.bodyMedium, color = Rose600)
                            Text("${result?.incorrectCount}", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = Rose600)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Final Score", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text("${String.format("%.2f", result?.score ?: 0.0)} / ${result?.totalQuestions}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Blue40)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = onNavigateBack,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Blue40)
                ) {
                    Text("Return to Quiz Hub", fontWeight = FontWeight.Bold)
                }
            }
        } else {
            // Active Question View
            val questions = qs.questions
            if (questions.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No questions in this set.")
                }
                return@Scaffold
            }

            val currentIndex = uiState.currentQuestionIndex
            val currentQuestion = questions[currentIndex]
            val selectedOption = uiState.selectedAnswers[currentIndex]
            val progress = (currentIndex + 1).toFloat() / questions.size.toFloat()

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp)
            ) {
                // Progress Bar
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = Blue40,
                    trackColor = Slate200
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Question ${currentIndex + 1} of ${questions.size}",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate500
                    )
                    Text(
                        text = "-20% Negative Marking",
                        style = MaterialTheme.typography.labelSmall,
                        color = Rose600,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Question Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Slate200),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = currentQuestion.questionText,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        if (currentQuestion.questionTextNp.isNotBlank()) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = currentQuestion.questionTextNp,
                                style = MaterialTheme.typography.bodyMedium,
                                color = Slate700
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Options List
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    currentQuestion.options.forEachIndexed { optIndex, optText ->
                        val isChosen = selectedOption == optIndex
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { quizViewModel.selectOption(currentIndex, optIndex) },
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(
                                1.5.dp,
                                if (isChosen) Blue40 else Slate200
                            ),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isChosen) Blue40.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surface
                            )
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = isChosen,
                                    onClick = { quizViewModel.selectOption(currentIndex, optIndex) },
                                    colors = RadioButtonDefaults.colors(selectedColor = Blue40)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = optText,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = if (isChosen) FontWeight.SemiBold else FontWeight.Normal,
                                    color = if (isChosen) Blue40 else Slate900
                                )
                            }
                        }
                    }
                }

                // Navigation Controls
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedButton(
                        onClick = { quizViewModel.previousQuestion() },
                        enabled = currentIndex > 0,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Previous")
                    }

                    if (currentIndex < questions.size - 1) {
                        Button(
                            onClick = { quizViewModel.nextQuestion() },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Blue40)
                        ) {
                            Text("Next")
                        }
                    } else {
                        Button(
                            onClick = { quizViewModel.finishAndSubmitQuiz() },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Emerald600)
                        ) {
                            Text("Submit Exam", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
