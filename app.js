// Fungsi untuk menyimpan pengaturan dari halaman setting
function simpanSetting() {
    const namaToko = document.getElementById('namaToko').value || "NUSAPOS";
    const modeUsaha = document.getElementById('modeUsaha').value;
    
    // Mengambil status checkbox fitur (Maksimal 5 menu terpilih)
    const fiturKasir = document.getElementById('menuKasir').checked;
    const fiturProduk = document.getElementById('menuProduk').checked;
    const fiturLaporan = document.getElementById('menuLaporan').checked;

    // Simpan semua konfigurasi ke LocalStorage
    localStorage.setItem('namaToko', namaToko);
    localStorage.setItem('modeUsaha', modeUsaha);
    localStorage.setItem('fiturKasir', fiturKasir);
    localStorage.setItem('fiturProduk', fiturProduk);
    localStorage.setItem('fiturLaporan', fiturLaporan);

    alert('Pengaturan Berhasil Disimpan!');
    window.location.href = 'index.html'; // Kembali ke Dashboard
}

// Fungsi untuk memuat tampilan dinamis di Dashboard (index.html)
document.addEventListener("DOMContentLoaded", function() {
    // Pastikan kita berada di halaman index.html (Dashboard)
    const namaTokoElement = document.getElementById('displayNamaToko');
    if (!namaTokoElement) return; 

    // Ambil data dari LocalStorage, jika belum ada set data default
    const namaToko = localStorage.getItem('namaToko') || "NUSAPOS Universal";
    const modeUsaha = localStorage.getItem('modeUsaha') || "Retail";
    const fiturKasir = localStorage.getItem('fiturKasir') !== "false"; // default true
    const fiturProduk = localStorage.getItem('fiturProduk') !== "false";
    const fiturLaporan = localStorage.getItem('fiturLaporan') !== "false";

    // Tampilkan Nama Toko yang diinput Owner
    namaTokoElement.innerText = namaToko;
    document.getElementById('displayModeUsaha').innerText = `Mode Usaha: ${modeUsaha}`;

    // Render Menu Dinamis Berdasarkan Pilihan Owner (Maksimal 5 Halaman Terkontrol)
    const containerMenu = document.getElementById('menuDinamis');
    containerMenu.innerHTML = ""; // Bersihkan kontainer

    if (fiturKasir) {
        containerMenu.innerHTML += `
            <button class="btn btn-kasir" onclick="bukaFitur('kasir')">🛒 Masuk Kasir (${modeUsaha})</button>
        `;
    }
    if (fiturProduk) {
        containerMenu.innerHTML += `
            <button class="btn btn-aksen" onclick="bukaFitur('produk')">📦 Kelola Produk & Jasa</button>
        `;
    }
    if (fiturLaporan) {
        containerMenu.innerHTML += `
            <button class="btn btn-aksen" onclick="bukaFitur('laporan')">📊 Lihat Laporan Penjualan</button>
        `;
    }
    
    // Selalu munculkan tombol setting agar owner bisa merubah halaman kapan saja
    containerMenu.innerHTML += `
        <a href="setting.html" class="btn btn-outline">⚙️ Pengaturan Halaman</a>
    `;
});

// Logika simulasi perpindahan halaman tanpa ganti file HTML (Single Page App)
function bukaFitur(namaFitur) {
    alert(`Membuka fitur: ${namaFitur.toUpperCase()}. (Logika form transaksi akan kita bangun di langkah berikutnya!)`);
}