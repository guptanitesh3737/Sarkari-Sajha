package com.sarkarisajha.app.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.sarkarisajha.app.SarkariSajhaApp
import com.sarkarisajha.app.model.Vacancy
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class VacancyRepository(
    private val firestore: FirebaseFirestore = SarkariSajhaApp.getFirestore()
) {
    private val vacanciesCollection = firestore.collection("vacancies")

    fun getPublishedVacanciesFlow(): Flow<List<Vacancy>> = callbackFlow {
        val query = vacanciesCollection
            .whereEqualTo("status", "published")
            .limit(100)

        val listener = query.addSnapshotListener { snapshot, error ->
            if (error != null) {
                close(error)
                return@addSnapshotListener
            }
            val list = snapshot?.documents?.mapNotNull { doc ->
                doc.toObject(Vacancy::class.java)?.copy(id = doc.id)
            } ?: emptyList()
            trySend(list)
        }
        awaitClose { listener.remove() }
    }

    suspend fun getVacancyById(id: String): Result<Vacancy> {
        return try {
            val doc = vacanciesCollection.document(id).get().await()
            if (doc.exists()) {
                val vacancy = doc.toObject(Vacancy::class.java)?.copy(id = doc.id)
                    ?: throw Exception("Failed to deserialize vacancy")
                Result.success(vacancy)
            } else {
                Result.failure(Exception("Vacancy not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
