package com.sarkarisajha.app.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.navArgument
import com.sarkarisajha.app.ui.ai.AiAssistantScreen
import com.sarkarisajha.app.ui.ai.AiAssistantViewModel
import com.sarkarisajha.app.ui.auth.AuthViewModel
import com.sarkarisajha.app.ui.auth.LoginScreen
import com.sarkarisajha.app.ui.auth.RegisterScreen
import com.sarkarisajha.app.ui.components.AppBottomBar
import com.sarkarisajha.app.ui.components.AppTopBar
import com.sarkarisajha.app.ui.dashboard.DashboardScreen
import com.sarkarisajha.app.ui.dashboard.DashboardViewModel
import com.sarkarisajha.app.ui.home.HomeScreen
import com.sarkarisajha.app.ui.home.HomeViewModel
import com.sarkarisajha.app.ui.notifications.NotificationsScreen
import com.sarkarisajha.app.ui.notifications.NotificationsViewModel
import com.sarkarisajha.app.ui.profile.ProfileScreen
import com.sarkarisajha.app.ui.profile.ProfileViewModel
import com.sarkarisajha.app.ui.quiz.QuizPlayScreen
import com.sarkarisajha.app.ui.quiz.QuizScreen
import com.sarkarisajha.app.ui.quiz.QuizViewModel
import com.sarkarisajha.app.ui.splash.SplashScreen
import com.sarkarisajha.app.ui.vacancies.SavedVacanciesScreen
import com.sarkarisajha.app.ui.vacancies.VacanciesScreen
import com.sarkarisajha.app.ui.vacancies.VacanciesViewModel
import com.sarkarisajha.app.ui.vacancies.VacancyDetailScreen

@Composable
fun AppNavHost(
    navController: NavHostController,
    authViewModel: AuthViewModel = viewModel(),
    homeViewModel: HomeViewModel = viewModel(),
    vacanciesViewModel: VacanciesViewModel = viewModel(),
    quizViewModel: QuizViewModel = viewModel(),
    dashboardViewModel: DashboardViewModel = viewModel(),
    notificationsViewModel: NotificationsViewModel = viewModel(),
    profileViewModel: ProfileViewModel = viewModel(),
    aiAssistantViewModel: AiAssistantViewModel = viewModel()
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute in listOf(
        Screen.Home.route,
        Screen.Vacancies.route,
        Screen.Quiz.route,
        Screen.AiAssistant.route,
        Screen.Dashboard.route
    )

    val notifState by notificationsViewModel.uiState.collectAsState()
    val unreadNotifs = notifState.notifications.count { !it.isRead }

    Scaffold(
        topBar = {
            if (showBottomBar) {
                val title = when (currentRoute) {
                    Screen.Home.route -> "SarkariSajha"
                    Screen.Vacancies.route -> "Government Vacancies"
                    Screen.Quiz.route -> "Lok Sewa Quiz Lab"
                    Screen.AiAssistant.route -> "AI Career Guide"
                    Screen.Dashboard.route -> "Candidate Dashboard"
                    else -> "SarkariSajha"
                }
                AppTopBar(
                    title = title,
                    unreadNotificationCount = unreadNotifs,
                    onNotificationClick = { navController.navigate(Screen.Notifications.route) }
                )
            }
        },
        bottomBar = {
            if (showBottomBar) {
                AppBottomBar(
                    currentRoute = currentRoute,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Splash.route,
            modifier = Modifier.padding(padding)
        ) {
            composable(Screen.Splash.route) {
                SplashScreen(
                    onSplashFinished = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Login.route) {
                LoginScreen(
                    authViewModel = authViewModel,
                    onNavigateToRegister = { navController.navigate(Screen.Register.route) },
                    onLoginSuccess = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onSkipGuest = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Register.route) {
                RegisterScreen(
                    authViewModel = authViewModel,
                    onNavigateToLogin = { navController.popBackStack() },
                    onRegisterSuccess = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Register.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Home.route) {
                HomeScreen(
                    homeViewModel = homeViewModel,
                    onNavigateToVacancyDetail = { id -> navController.navigate(Screen.VacancyDetail.createRoute(id)) },
                    onNavigateToVacancies = { navController.navigate(Screen.Vacancies.route) },
                    onNavigateToQuiz = { qId -> navController.navigate(Screen.QuizPlay.createRoute(qId)) },
                    onNavigateToAiAssistant = { navController.navigate(Screen.AiAssistant.route) }
                )
            }

            composable(Screen.Vacancies.route) {
                VacanciesScreen(
                    vacanciesViewModel = vacanciesViewModel,
                    onNavigateToDetail = { id -> navController.navigate(Screen.VacancyDetail.createRoute(id)) }
                )
            }

            composable(
                route = Screen.VacancyDetail.route,
                arguments = listOf(navArgument("vacancyId") { type = NavType.StringType })
            ) { backStackEntry ->
                val vacancyId = backStackEntry.arguments?.getString("vacancyId") ?: ""
                VacancyDetailScreen(
                    vacancyId = vacancyId,
                    vacanciesViewModel = vacanciesViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.SavedVacancies.route) {
                SavedVacanciesScreen(
                    vacanciesViewModel = vacanciesViewModel,
                    onNavigateToDetail = { id -> navController.navigate(Screen.VacancyDetail.createRoute(id)) }
                )
            }

            composable(Screen.Quiz.route) {
                QuizScreen(
                    quizViewModel = quizViewModel,
                    onStartQuiz = { id -> navController.navigate(Screen.QuizPlay.createRoute(id)) }
                )
            }

            composable(
                route = Screen.QuizPlay.route,
                arguments = listOf(navArgument("quizSetId") { type = NavType.StringType })
            ) { backStackEntry ->
                val quizSetId = backStackEntry.arguments?.getString("quizSetId") ?: ""
                QuizPlayScreen(
                    quizSetId = quizSetId,
                    quizViewModel = quizViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Dashboard.route) {
                DashboardScreen(
                    dashboardViewModel = dashboardViewModel,
                    onNavigateToLogin = { navController.navigate(Screen.Login.route) },
                    onNavigateToSavedVacancies = { navController.navigate(Screen.SavedVacancies.route) },
                    onNavigateToProfile = { navController.navigate(Screen.Profile.route) },
                    onNavigateToVacancyDetail = { id -> navController.navigate(Screen.VacancyDetail.createRoute(id)) }
                )
            }

            composable(Screen.Notifications.route) {
                NotificationsScreen(
                    notificationsViewModel = notificationsViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToVacancyDetail = { id -> navController.navigate(Screen.VacancyDetail.createRoute(id)) }
                )
            }

            composable(Screen.Profile.route) {
                ProfileScreen(
                    profileViewModel = profileViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onSignOut = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(Screen.Home.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.AiAssistant.route) {
                AiAssistantScreen(
                    aiAssistantViewModel = aiAssistantViewModel,
                    onNavigateToVacancyDetail = { id -> navController.navigate(Screen.VacancyDetail.createRoute(id)) }
                )
            }
        }
    }
}
