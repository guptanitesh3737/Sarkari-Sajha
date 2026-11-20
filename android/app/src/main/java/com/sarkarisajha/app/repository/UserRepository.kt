package com.sarkarisajha.app.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.sarkarisajha.app.SarkariSajhaApp
import com.sarkarisajha.app.model.ApplicationTrack
import com.sarkarisajha.app.model.SavedVacancyItem
import com.sarkarisajha.app.model.UserProfile
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class UserRepository(
    private val firestore: FirebaseFirestore = SarkariSajhaApp.getFirestore()
) {
    private val usersCollection = firestore.collection("users")

    fun getUserProfileFlow(userId: String): Flow<UserProfile?> = callbackFlow {
        if (userId.isBlank()) {
            trySend(null)
            close()
            return@callbackFlow
        }
        val listener = usersCollection.document(userId).addSnapshotListener { snapshot, error ->
            if (error != null) {
                close(error)
                return@addSnapshotListener
            }
            val profile = snapshot?.toObject(UserProfile::class.java)?.copy(id = snapshot.id)
            trySend(profile)
        }
        awaitClose { listener.remove() }
    }

    suspend fun saveUserProfile(profile: UserProfile): Result<Unit> {
        return try {
            usersCollection.document(profile.id).set(profile, SetOptions.merge()).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getSavedVacanciesFlow(userId: String): Flow<List<SavedVacancyItem>> = callbackFlow {
        if (userId.isBlank()) {
            trySend(emptyList())
            close()
            return@callbackFlow
        }
        val listener = usersCollection.document(userId).collection("saved_vacancies")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val list = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(SavedVacancyItem::class.java)?.copy(id = doc.id)
                } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    suspend fun toggleSaveVacancy(userId: String, vacancyId: String): Result<Boolean> {
        return try {
            val docRef = usersCollection.document(userId).collection("saved_vacancies").document(vacancyId)
            val doc = docRef.get().await()
            if (doc.exists()) {
                docRef.delete().await()
                Result.success(false) // Unsaved
            } else {
                val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
                val item = SavedVacancyItem(
                    id = vacancyId,
                    userId = userId,
                    vacancyId = vacancyId,
                    savedAt = now
                )
                docRef.set(item).await()
                Result.success(true) // Saved
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getApplicationsFlow(userId: String): Flow<List<ApplicationTrack>> = callbackFlow {
        if (userId.isBlank()) {
            trySend(emptyList())
            close()
            return@callbackFlow
        }
        val listener = usersCollection.document(userId).collection("applications")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val list = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(ApplicationTrack::class.java)?.copy(id = doc.id)
                } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }
}
