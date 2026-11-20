package com.sarkarisajha.app.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.sarkarisajha.app.SarkariSajhaApp
import com.sarkarisajha.app.model.QuizAttempt
import com.sarkarisajha.app.model.QuizSet
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class QuizRepository(
    private val firestore: FirebaseFirestore = SarkariSajhaApp.getFirestore()
) {
    private val quizSetsCollection = firestore.collection("quiz_sets")
    private val quizAttemptsCollection = firestore.collection("quiz_attempts")

    fun getQuizSetsFlow(): Flow<List<QuizSet>> = callbackFlow {
        val listener = quizSetsCollection.limit(50).addSnapshotListener { snapshot, error ->
            if (error != null) {
                close(error)
                return@addSnapshotListener
            }
            val list = snapshot?.documents?.mapNotNull { doc ->
                doc.toObject(QuizSet::class.java)?.copy(id = doc.id)
            } ?: emptyList()
            trySend(list)
        }
        awaitClose { listener.remove() }
    }

    suspend fun getQuizSetById(id: String): Result<QuizSet> {
        return try {
            val doc = quizSetsCollection.document(id).get().await()
            if (doc.exists()) {
                val qs = doc.toObject(QuizSet::class.java)?.copy(id = doc.id)
                    ?: throw Exception("Failed to deserialize QuizSet")
                Result.success(qs)
            } else {
                Result.failure(Exception("Quiz set not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun saveQuizAttempt(attempt: QuizAttempt): Result<String> {
        return try {
            val docRef = if (attempt.id.isNotBlank()) {
                quizAttemptsCollection.document(attempt.id)
            } else {
                quizAttemptsCollection.document()
            }
            val finalAttempt = attempt.copy(id = docRef.id)
            docRef.set(finalAttempt).await()
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getUserAttemptsFlow(userId: String): Flow<List<QuizAttempt>> = callbackFlow {
        if (userId.isBlank()) {
            trySend(emptyList())
            close()
            return@callbackFlow
        }
        val listener = quizAttemptsCollection
            .whereEqualTo("userId", userId)
            .limit(25)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val list = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(QuizAttempt::class.java)?.copy(id = doc.id)
                } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }
}
