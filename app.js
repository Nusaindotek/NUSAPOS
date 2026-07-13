// Variabel Data Lokal (Array)
let produkData = JSON.parse(localStorage.getItem('produkData')) || [];
let transaksiData = JSON.parse(localStorage.getItem('transaksiData')) || [];
let keranjang = [];

// Fungsi Pengaturan dari halaman setting.html
function simpanSetting() {
    const namaToko = document.getElementById('namaToko').value || "NUSAPOS";
    const modeUsaha = document.getElementById('modeUsaha').value;
    const fiturKasir = document.getElementById('menuKasir').checked;
    const fiturProduk = document.getElementById('menuProduk').checked;
    const fiturLaporan = document.getElementById('menuLaporan').checked;

    localStorage.setItem('namaToko', namaToko);
    localStorage.setItem('modeUsaha', modeUsaha);
    localStorage.setItem('fiturKasir', fiturKasir);
    localStorage.setItem('fiturProduk', fiturProduk);
    localStorage.setItem('fiturLaporan', fiturLaporan);

    alert('Pengaturan Berhasil Disimpan!');
    window.location.href = 'index.html';
}

// Inisialisasi Dashboard Utama
document.addEventListener("DOMContentLoaded", function() {
    if (!document.getElementById('displayNamaToko')) return; 

    const namaToko = localStorage.getItem('namaToko') || "NUSAPOS Universal";
    const modeUsaha = localStorage.getItem('modeUsaha') || "Retail";
    const fiturKasir = localStorage.getItem('fiturKasir') !== "false";
    const fiturProduk = localStorage.getItem('fiturProduk') !== "false";
    const fiturLaporan = localStorage.getItem('fiturLaporan') !== "false";

    document.getElementById('displayNamaToko').innerText = namaToko;
    document.getElementById('displayModeUsaha').innerText = `Mode Usaha: ${modeUsaha}`;

    // Sembunyikan kolom stok jika owner memilih Mode Jasa
    const kolomStok = document.getElementById('kolomStok');
    if(kolomStok && modeUsaha === "Jasa") {
        kolomStok.style.display = "none";
    }

    // Render Tombol Maksimal 5 Menu Terkontrol
    const containerMenu = document.getElementById('menuDinamis');
    containerMenu.innerHTML = ""; 

    if (fiturKasir) {
        containerMenu.innerHTML += `<button class="btn btn-kasir" onclick="bukaFitur('fiturKasir')">🛒 Masuk Kasir</button>`;
    }
    if (fiturProduk) {
        containerMenu.innerHTML += `<button class="btn btn-aksen" onclick="bukaFitur('fiturProduk')">📦 Kelola Produk & Jasa</button>`;
    }
    if (fiturLaporan) {
        containerMenu.innerHTML += `<button class="btn btn-aksen" onclick="bukaFitur('fiturLaporan')">📊 Lihat Laporan Penjualan</button>`;
    }
    containerMenu.innerHTML += `<a href="setting.html" class="btn btn-outline">⚙️ Pengaturan Halaman</a>`;

    // Render data pendukung
    renderDaftarProduk();
    renderKasirProduk();
    renderLaporan();
});

// Sistem Navigasi SPA (Single Page Application)
function bukaFitur(idFitur) {
    document.getElementById('halamanDashboard').style.display = "none";
    document.getElementById(idFitur).style.display = "block";
}

function kembaliKeDashboard() {
    document.getElementById('fiturKasir').style.style.display = "none";
    document.getElementById('fiturProduk').style.display = "none";
    document.getElementById('fiturLaporan').style.display = "none";
    document.getElementById('halamanDashboard').style.display = "block";
}

// ================= FITUR KELOLA PRODUK =================
function tambahProdukKeData() {
    const nama = document.getElementById('inputNamaProduk').value;
    const harga = parseInt(document.getElementById('inputHargaProduk').value);
    const stok = parseInt(document.getElementById('inputStokProduk').value) || 0;

    if(!nama || !harga) return alert("Nama dan Harga wajib diisi!");

    produkData.push({ id: Date.now(), nama, harga, stok });
    localStorage.setItem('produkData', JSON.stringify(produkData));
    
    alert("Item berhasil disimpan!");
    document.getElementById('formProduk').reset();
    renderDaftarProduk();
    renderKasirProduk();
}

function renderDaftarProduk() {
    const container = document.getElementById('daftarProdukToko');
    if(!container) return;
    container.innerHTML = produkData.length === 0 ? "<p style='color:#7292bf; font-size:12px;'>Belum ada produk.</p>" : "";
    
    produkData.forEach(p => {
        container.innerHTML += `
            <div class="flex-space" style="border-bottom: 1px solid #153460; padding: 5px 0;">
                <span>${p.nama} (Rp ${p.harga})</span>
                <span>Stok: ${p.stok}</span>
            </div>
        `;
    });
}

// ================= FITUR MESIN KASIR =================
function renderKasirProduk() {
    const container = document.getElementById('listProdukKasir');
    if(!container) return;
    container.innerHTML = produkData.length === 0 ? "<p style='color:#7292bf; font-size:12px;'>Isi produk terlebih dahulu di menu Kelola Produk.</p>" : "";
    
    produkData.forEach(p => {
        container.innerHTML += `
            <button class="btn btn-outline" style="margin-bottom:8px; padding:10px; font-size:14px;" onclick="tambahKeKeranjang(${p.id})">
                + ${p.nama} (Rp ${p.harga})
            </button>
        `;
    });
}

function tambahKeKeranjang(id) {
    const produk = produkData.find(p => p.id === id);
    const itemKeranjang = keranjang.find(k => k.id === id);

    if(itemKeranjang) {
        itemKeranjang.qty++;
    } else {
        keranjang.push({ ...produk, qty: 1 });
    }
    updateKeranjangView();
}

function updateKeranjangView() {
    const container = document.getElementById('keranjangBelanja');
    const totalElement = document.getElementById('totalBelanja');
    container.innerHTML = "";
    
    let total = 0;
    keranjang.forEach(k => {
        total += (k.harga * k.qty);
        container.innerHTML += `
            <div class="flex-space">
                <span>${k.nama} x ${k.qty}</span>
                <span>Rp ${k.harga * k.qty}</span>
            </div>
        `;
    });
    totalElement.innerText = `Rp ${total}`;
}

function prosesTransaksi() {
    if(keranjang.length === 0) return alert("Keranjang masih kosong!");

    let total = keranjang.reduce((sum, item) => sum + (item.harga * item.qty), 0);
    
    // Simpan data transaksi
    transaksiData.push({
        id: Date.now(),
        waktu: new Date().toLocaleTimeString(),
        items: keranjang,
        total: total
    });
    
    localStorage.setItem('transaksiData', JSON.stringify(transaksiData));
    
    alert("Transaksi Sukses Disimpan!");
    keranjang = [];
    updateKeranjangView();
    renderLaporan();
    kembaliKeDashboard();
}

// ================= FITUR LAPORAN =================
function renderLaporan() {
    const omsetElement = document.getElementById('omsetLaporan');
    const container = document.getElementById('riwayatTransaksi');
    if(!omsetElement || !container) return;

    let totalOmset = transaksiData.reduce((sum, t) => sum + t.total, 0);
    omsetElement.innerText = `Rp ${totalOmset}`;

    container.innerHTML = transaksiData.length === 0 ? "<p style='color:#7292bf; font-size:12px;'>Belum ada transaksi.</p>" : "";
    
    transaksiData.forEach(t => {
        container.innerHTML += `
            <div style="background:#0f2d59; padding:8px; border-radius:6px; margin-bottom:8px; font-size:12px;">
                <div class="flex-space"><strong>Nota #${t.id.toString().slice(-4)}</strong> <span>${t.waktu}</span></div>
                <div style="color:#17b7be;">Total: Rp ${t.total}</div>
            </div>
        `;
    });
}