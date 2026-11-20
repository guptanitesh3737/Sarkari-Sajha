package com.sarkarisajha.app.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.sarkarisajha.app.SarkariSajhaApp
import com.sarkarisajha.app.model.NotificationItem
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

class NotificationRepository(
    private val firestore: FirebaseFirestore = SarkariSajhaApp.getFirestore()
) {
    private val notificationsCollection = firestore.collection("notifications")

    fun getNotificationsFlow(): Flow<List<NotificationItem>> = callbackFlow {
        val listener = notificationsCollection
            .limit(30)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val list = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(NotificationItem::class.java)?.copy(id = doc.id)
                } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }
}
