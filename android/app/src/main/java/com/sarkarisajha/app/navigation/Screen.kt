package com.sarkarisajha.app.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Register : Screen("register")
    object Home : Screen("home")
    object Vacancies : Screen("vacancies")
    object VacancyDetail : Screen("vacancy_detail/{vacancyId}") {
        fun createRoute(vacancyId: String) = "vacancy_detail/$vacancyId"
    }
    object SavedVacancies : Screen("saved_vacancies")
    object Quiz : Screen("quiz")
    object QuizPlay : Screen("quiz_play/{quizSetId}") {
        fun createRoute(quizSetId: String) = "quiz_play/$quizSetId"
    }
    object Dashboard : Screen("dashboard")
    object Notifications : Screen("notifications")
    object Profile : Screen("profile")
    object AiAssistant : Screen("ai_assistant")
}
