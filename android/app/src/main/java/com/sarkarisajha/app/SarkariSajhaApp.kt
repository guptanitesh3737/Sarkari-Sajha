package com.sarkarisajha.app

import android.app.Application
import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreSettings

class SarkariSajhaApp : Application() {

    override fun onCreate() {
        super.onCreate()
        instance = this
        try {
            FirebaseApp.initializeApp(this)
            Log.d("SarkariSajhaApp", "Firebase initialized successfully")
        } catch (e: Exception) {
            Log.e("SarkariSajhaApp", "Firebase initialization error", e)
        }
    }

    companion object {
        lateinit var instance: SarkariSajhaApp
            private set

        const val FIRESTORE_DATABASE_ID = "ai-studio-sarkarisajha-bc29b148-0dd1-4e8b-98be-73728674acd3"

        fun getFirestore(): FirebaseFirestore {
            return try {
                val app = FirebaseApp.getInstance()
                val firestore = FirebaseFirestore.getInstance(app, FIRESTORE_DATABASE_ID)
                val settings = FirebaseFirestoreSettings.Builder()
                    .setPersistenceEnabled(true)
                    .build()
                firestore.firestoreSettings = settings
                firestore
            } catch (e: Exception) {
                // Fallback to standard instance if database ID resolution is handled via default route
                FirebaseFirestore.getInstance()
            }
        }
    }
}
