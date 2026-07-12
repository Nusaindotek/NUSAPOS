package com.nusaindotek.nusapos

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class DatabaseHelper(context: Context) : SQLiteOpenHelper(context, "NusaPos.db", null, 1) {

    override fun onCreate(db: SQLiteDatabase?) {
        db?.execSQL("CREATE TABLE tb_produk(id INTEGER PRIMARY KEY AUTOINCREMENT, nama_produk TEXT, kategori TEXT, harga INTEGER, stok INTEGER)")
        db?.execSQL("CREATE TABLE tb_jasa(id INTEGER PRIMARY KEY AUTOINCREMENT, nama_jasa TEXT, kategori TEXT, harga INTEGER)")
        db?.execSQL("CREATE TABLE tb_transaksi(id INTEGER PRIMARY KEY AUTOINCREMENT, tanggal TEXT, mode TEXT, total INTEGER, detail TEXT)")
    }

    override fun onUpgrade(db: SQLiteDatabase?, oldVersion: Int, newVersion: Int) {
        db?.execSQL("DROP TABLE IF EXISTS tb_produk")
        db?.execSQL("DROP TABLE IF EXISTS tb_jasa")
        db?.execSQL("DROP TABLE IF EXISTS tb_transaksi")
        onCreate(db)
    }

    fun tambahProduk(nama: String, kategori: String, harga: Int, stok: Int): Boolean {
        val db = this.writableDatabase
        val values = ContentValues()
        values.put("nama_produk", nama)
        values.put("kategori", kategori)
        values.put("harga", harga)
        values.put("stok", stok)
        return db.insert("tb_produk", null, values) != -1L
    }
    
    fun getAllProduk(): Cursor { return this.readableDatabase.rawQuery("SELECT * FROM tb_produk", null) }

    fun tambahJasa(nama: String, kategori: String, harga: Int): Boolean {
        val db = this.writableDatabase
        val values = ContentValues()
        values.put("nama_jasa", nama)
        values.put("kategori", kategori)
        values.put("harga", harga)
        return db.insert("tb_jasa", null, values) != -1L
    }
    
    fun getAllJasa(): Cursor { return this.readableDatabase.rawQuery("SELECT * FROM tb_jasa", null) }
}