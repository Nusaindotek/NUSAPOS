// ==================== GLOBAL VARIABLE ====================
let keranjangBelanja = [];
let menuKustom = JSON.parse(localStorage.getItem('menuKustom')) || [];
const MAX_HALAMAN_KUSTOM = 2;

// ==================== ENGINE PENGATURAN ====================
function simpanSetting() {
    const namaToko = document.getElementById('namaToko').value || "NUSAPOS";
    const modeUsaha = document.getElementById('modeUsaha').value;
    const fiturProduk = document.getElementById('menuProduk').checked;
    const fiturLaporan = document.getElementById('menuLaporan').checked;
    
    localStorage.setItem('namaToko', namaToko);
    localStorage.setItem('modeUsaha', modeUsaha);
    localStorage.setItem('fiturProduk', fiturProduk);
    localStorage.setItem('fiturLaporan', fiturLaporan);
    
    alert('Pengaturan Berhasil Disimpan!');
    window.location.href = 'index.html';
}

function muatSetting() {
    const namaToko = localStorage.getItem('namaToko');
    const modeUsaha = localStorage.getItem('modeUsaha');
    const fiturProduk = localStorage.getItem('fiturProduk');
    const fiturLaporan = localStorage.getItem('fiturLaporan');

    if(document.getElementById('namaToko')) document.getElementById('namaToko').value = namaToko || "NUSAPOS";
    if(document.getElementById('modeUsaha')) document.getElementById('modeUsaha').value = modeUsaha || "Retail";
    if(document.getElementById('menuProduk')) document.getElementById('menuProduk').checked = (fiturProduk === "true");
    if(document.getElementById('menuLaporan')) document.getElementById('menuLaporan').checked = (fiturLaporan === "true");
}

// ==================== ENGINE UTAMA & NAVIGASI ====================
function getProdukByMode() {
    const database = JSON.parse(localStorage.getItem('databaseProduk')) || [];
    const modeUsaha = localStorage.getItem('modeUsaha') || "Retail";
    const tipeTarget = modeUsaha === "Jasa" ? "jasa" : "produk";
    return database.filter(item => item.tipe === tipeTarget);
}

document.addEventListener("DOMContentLoaded", function() {
    const namaTokoElement = document.getElementById('displayNamaToko');
    if (namaTokoElement) {
        const namaToko = localStorage.getItem('namaToko') || "NUSAPOS Universal";
        const modeUsaha = localStorage.getItem('modeUsaha') || "Retail";
        const fiturProduk = localStorage.getItem('fiturProduk') === "true";
        const fiturLaporan = localStorage.getItem('fiturLaporan') === "true";
        
        namaTokoElement.innerText = namaToko;
        document.getElementById('displayModeUsaha').innerText = `Mode Usaha: ${modeUsaha}`;
        
        renderMenuDinamis(modeUsaha, fiturProduk, fiturLaporan);
        renderPilihanProdukKasir();
        renderTabelProduk();
        renderLaporanPenjualan();
        cekModeStok();
        if(document.getElementById('daftarHalamanKustom')) renderDaftarHalamanKustom();
    }
    // Jika di halaman setting, muat data
    if(document.getElementById('formSetting')) muatSetting();
});

function renderMenuDinamis(modeUsaha, fiturProduk, fiturLaporan) {
    const containerMenu = document.getElementById('menuDinamis');
    if(!containerMenu) return;
    let html = `<button class="btn btn-kasir" onclick="bukaFitur('kasir')">🛒 Masuk Kasir (${modeUsaha})</button>`;
    if (fiturProduk) { html += `<button class="btn btn-aksen" onclick="bukaFitur('produk')">📦 Kelola Produk & Jasa</button>`; }
    if (fiturLaporan) { html += `<button class="btn btn-aksen" onclick="bukaFitur('laporan')">📊 Lihat Laporan Penjualan</button>`; }
    menuKustom.forEach((menu, index) => { html += `<button class="btn btn-outline" onclick="bukaHalamanKustom(${index})">${menu.icon} ${menu.nama}</button>`; });
    html += `<a href="setting.html" class="btn btn-outline">⚙️ Pengaturan Halaman</a>`;
    containerMenu.innerHTML = html;
}

function bukaHalamanKustom(index) {
    const menu = menuKustom[index];
    const layar = ['layarUtama', 'layarKasir', 'layarProduk', 'layarLaporan', 'layarKustom'];
    layar.forEach(id => document.getElementById(id).style.display = 'none');
    
    document.getElementById('layarKustom').style.display = 'block';
    document.getElementById('judulLayarKustom').innerText = `${menu.icon} ${menu.nama}`;
}

function bukaFitur(namaFitur) {
    const layar = { 'dashboard': 'layarUtama', 'kasir': 'layarKasir', 'produk': 'layarProduk', 'laporan': 'layarLaporan' };
    Object.values(layar).forEach(id => document.getElementById(id).style.display = 'none');
    document.getElementById('layarKustom').style.display = 'none';
    
    const target = layar[namaFitur];
    if (target) document.getElementById(target).style.display = 'block';
    if (namaFitur === 'kasir') renderPilihanProdukKasir();
    if (namaFitur === 'produk') { renderTabelProduk(); cekModeStok(); }
    if (namaFitur === 'laporan') renderLaporanPenjualan();
}

function cekModeStok() {
    const modeUsaha = localStorage.getItem('modeUsaha') || "Retail";
    const inputStok = document.getElementById('prodStok');
    if(inputStok) {
        if(modeUsaha === "Jasa") { inputStok.value = 0; inputStok.disabled = true; inputStok.placeholder = "Mode Jasa - Stok Nonaktif"; } 
        else { inputStok.disabled = false; inputStok.placeholder = "Jumlah Stok Fisik"; }
    }
}

// ==================== ENGINE PRODUK & KASIR (TETAP) ====================
function ambilDataProduk() { return JSON.parse(localStorage.getItem('databaseProduk')) || []; }

function simpanProduk() {
    const nama = document.getElementById('prodNama').value.trim();
    const harga = parseFloat(document.getElementById('prodHarga').value) || 0;
    const stok = parseInt(document.getElementById('prodStok').value) || 0;
    const modeUsaha = localStorage.getItem('modeUsaha') || "Retail";
    const tipe = modeUsaha === "Jasa" ? "jasa" : "produk";
    if (!nama || harga <= 0) { alert("Nama produk dan harga wajib diisi!"); return; }
    let database = ambilDataProduk();
    database.push({ id: Date.now(), nama, harga, stok: tipe === "jasa" ? "-" : stok, tipe });
    localStorage.setItem('databaseProduk', JSON.stringify(database));
    document.getElementById('formProduk').reset();
    renderTabelProduk();
}

function renderTabelProduk() {
    const database = getProdukByMode();
    const tbody = document.getElementById('tabelProdukBody');
    if(!tbody) return;
    tbody.innerHTML = database.length === 0 ? `<tr><td colspan="5" style="text-align:center;">Belum ada data.</td></tr>` : "";
    database.forEach((item, index) => {
        tbody.innerHTML += `<tr><td>${index + 1}</td><td>${item.nama}</td><td>Rp ${item.harga.toLocaleString('id-ID')}</td><td>${item.stok}</td><td><button onclick="hapusProduk(${item.id})">X</button></td></tr>`;
    });
}

function renderPilihanProdukKasir() {
    const database = getProdukByMode();
    const select = document.getElementById('kasirPilihProduk');
    if(!select) return;
    select.innerHTML = `<option value="">-- Pilih Produk/Jasa --</option>`;
    database.forEach(item => { select.innerHTML += `<option value="${item.id}">${item.nama} - Rp ${item.harga.toLocaleString('id-ID')}</option>`; });
}

function tambahKeKeranjang() {
    const select = document.getElementById('kasirPilihProduk');
    const id = parseInt(select.value);
    if (!id) return;
    const prod = ambilDataProduk().find(i => i.id === id);
    const item = keranjangBelanja.find(i => i.id === id);
    if (item) item.qty++;
    else keranjangBelanja.push({ ...prod, qty: 1 });
    renderKeranjang();
    select.value = "";
}

function renderKeranjang() {
    const tbody = document.getElementById('keranjangBody');
    let total = 0;
    tbody.innerHTML = "";
    keranjangBelanja.forEach(i => {
        total += (i.harga * i.qty);
        tbody.innerHTML += `<tr><td>${i.nama} x ${i.qty}</td><td>Rp ${(i.harga * i.qty).toLocaleString('id-ID')}</td></tr>`;
    });
    document.getElementById('kasirTotalBelanja').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function prosesTransaksi() {
    if (keranjangBelanja.length === 0) return alert("Keranjang kosong!");
    let laporan = JSON.parse(localStorage.getItem('databaseLaporan')) || [];
    let total = keranjangBelanja.reduce((sum, i) => sum + (i.harga * i.qty), 0);
    laporan.push({ idTransaksi: "TRX-" + Date.now(), tanggal: new Date().toLocaleString(), total, detail: keranjangBelanja });
    localStorage.setItem('databaseLaporan', JSON.stringify(laporan));
    keranjangBelanja = [];
    renderKeranjang();
    alert("Transaksi Berhasil!");
}

function renderLaporanPenjualan() {
    const laporan = JSON.parse(localStorage.getItem('databaseLaporan')) || [];
    const div = document.getElementById('isiLaporan');
    if(!div) return;
    div.innerHTML = laporan.map(trx => `<div style="background:#5A0000; padding:10px; margin-bottom:5px;">${trx.idTransaksi} - Rp ${trx.total.toLocaleString('id-ID')}</div>`).join('');
}

// ==================== HALAMAN KUSTOM ====================
function tambahHalamanKustom() {
    const nama = document.getElementById('namaHalamanBaru').value.trim();
    const icon = document.getElementById('iconHalamanBaru').value.trim() || "📄";
    if(!nama) return alert("Nama wajib diisi!");
    if(menuKustom.length >= MAX_HALAMAN_KUSTOM) return alert("Maksimal 2 halaman!");
    menuKustom.push({nama, icon});
    localStorage.setItem('menuKustom', JSON.stringify(menuKustom));
    renderDaftarHalamanKustom();
}

function renderDaftarHalamanKustom() {
    const container = document.getElementById('daftarHalamanKustom');
    if(!container) return;
    container.innerHTML = menuKustom.map((m, i) => `<div>${m.icon} ${m.nama} <button onclick="hapusHalamanKustom(${i})">Hapus</button></div>`).join('');
}

function hapusHalamanKustom(i) {
    menuKustom.splice(i, 1);
    localStorage.setItem('menuKustom', JSON.stringify(menuKustom));
    renderDaftarHalamanKustom();
}
