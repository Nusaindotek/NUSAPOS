package com.nusaindotek.nusapos

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.TextView

class KasirActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_kasir)

        val mode = intent.getStringExtra("MODE")
        findViewById<TextView>(R.id.txt_mode).text = "MODE: $mode"
    }
}