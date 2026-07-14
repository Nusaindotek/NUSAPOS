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
    
    renderDaftarHalamanKustom();
}

// ==================== ENGINE UTAMA ====================
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
        if(document.getElementById('displayModeUsaha')) document.getElementById('displayModeUsaha').innerText = `Mode Usaha: ${modeUsaha}`;
        
        renderMenuDinamis(modeUsaha, fiturProduk, fiturLaporan);
        if(document.getElementById('kasirPilihProduk')) renderPilihanProdukKasir();
        if(document.getElementById('tabelProdukBody')) renderTabelProduk();
        if(document.getElementById('isiLaporan')) renderLaporanPenjualan();
    }
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
    ['layarUtama', 'layarKasir', 'layarProduk', 'layarLaporan'].forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).style.display = 'none';
    });
    const layarKustom = document.getElementById('layarKustom');
    if(layarKustom) {
        layarKustom.style.display = 'block';
        document.getElementById('judulLayarKustom').innerText = `${menu.icon} ${menu.nama}`;
    }
}

function bukaFitur(namaFitur) {
    ['layarUtama', 'layarKasir', 'layarProduk', 'layarLaporan', 'layarKustom'].forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).style.display = 'none';
    });
    const map = { 'kasir': 'layarKasir', 'produk': 'layarProduk', 'laporan': 'layarLaporan', 'dashboard': 'layarUtama' };
    if(document.getElementById(map[namaFitur])) document.getElementById(map[namaFitur]).style.display = 'block';
    
    if (namaFitur === 'kasir') renderPilihanProdukKasir();
    if (namaFitur === 'produk') { renderTabelProduk(); cekModeStok(); }
    if (namaFitur === 'laporan') renderLaporanPenjualan();
}

function cekModeStok() {
    const modeUsaha = localStorage.getItem('modeUsaha') || "Retail";
    const inputStok = document.getElementById('prodStok');
    if(inputStok) {
        if(modeUsaha === "Jasa") { inputStok.value = 0; inputStok.disabled = true; } 
        else { inputStok.disabled = false; }
    }
}

function ambilDataProduk() { return JSON.parse(localStorage.getItem('databaseProduk')) || []; }

function simpanProduk() {
    const nama = document.getElementById('prodNama').value.trim();
    const harga = parseFloat(document.getElementById('prodHarga').value) || 0;
    const stok = parseInt(document.getElementById('prodStok').value) || 0;
    const tipe = (localStorage.getItem('modeUsaha') === "Jasa") ? "jasa" : "produk";
    if (!nama || harga <= 0) return alert("Isi data dengan benar!");
    let db = ambilDataProduk();
    db.push({ id: Date.now(), nama, harga, stok: tipe === "jasa" ? "-" : stok, tipe });
    localStorage.setItem('databaseProduk', JSON.stringify(db));
    renderTabelProduk();
    document.getElementById('formProduk').reset();
}

function renderTabelProduk() {
    const db = getProdukByMode();
    const tbody = document.getElementById('tabelProdukBody');
    if(!tbody) return;
    tbody.innerHTML = db.map((item, i) => `<tr><td>${i+1}</td><td>${item.nama}</td><td>${item.harga}</td><td>${item.stok}</td><td><button onclick="hapusProduk(${item.id})">X</button></td></tr>`).join('');
}

function hapusProduk(id) {
    let db = ambilDataProduk().filter(i => i.id !== id);
    localStorage.setItem('databaseProduk', JSON.stringify(db));
    renderTabelProduk();
}

function renderPilihanProdukKasir() {
    const db = getProdukByMode();
    const sel = document.getElementById('kasirPilihProduk');
    if(!sel) return;
    sel.innerHTML = `<option value="">Pilih</option>` + db.map(i => `<option value="${i.id}">${i.nama}</option>`).join('');
}

function tambahKeKeranjang() {
    const sel = document.getElementById('kasirPilihProduk');
    const prod = ambilDataProduk().find(i => i.id == sel.value);
    if(prod) { keranjangBelanja.push(prod); renderKeranjang(); }
}

function renderKeranjang() {
    const tbody = document.getElementById('keranjangBody');
    if(!tbody) return;
    tbody.innerHTML = keranjangBelanja.map(i => `<tr><td>${i.nama}</td><td>${i.harga}</td></tr>`).join('');
}

function prosesTransaksi() {
    let total = keranjangBelanja.reduce((a,b) => a + b.harga, 0);
    let lap = JSON.parse(localStorage.getItem('databaseLaporan')) || [];
    lap.push({ id: Date.now(), total });
    localStorage.setItem('databaseLaporan', JSON.stringify(lap));
    keranjangBelanja = [];
    renderKeranjang();
    alert("Transaksi Selesai!");
}

function renderLaporanPenjualan() {
    const lap = JSON.parse(localStorage.getItem('databaseLaporan')) || [];
    const div = document.getElementById('isiLaporan');
    if(div) div.innerHTML = lap.map(i => `<div>TRX: ${i.total}</div>`).join('');
}

function tambahHalamanKustom() {
    const nama = document.getElementById('namaHalamanBaru').value.trim();
    if(menuKustom.length < MAX_HALAMAN_KUSTOM) {
        menuKustom.push({nama, icon: "📄"});
        localStorage.setItem('menuKustom', JSON.stringify(menuKustom));
        renderDaftarHalamanKustom();
    }
}

function renderDaftarHalamanKustom() {
    const con = document.getElementById('daftarHalamanKustom');
    if(con) con.innerHTML = menuKustom.map((m, i) => `<div>${m.nama} <button onclick="hapusHalamanKustom(${i})">X</button></div>`).join('');
}

function hapusHalamanKustom(i) {
    menuKustom.splice(i, 1);
    localStorage.setItem('menuKustom', JSON.stringify(menuKustom));
    renderDaftarHalamanKustom();
}
