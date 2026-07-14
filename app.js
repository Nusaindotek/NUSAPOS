// ==================== GLOBAL VARIABLE ====================
let keranjangBelanja = [];
let menuKustom = JSON.parse(localStorage.getItem('menuKustom')) || [];

// Fungsi untuk menyimpan pengaturan dari halaman setting
function simpanSetting() {
    const namaToko = document.getElementById('namaToko').value || "NUSAPOS";
    const modeUsaha = document.getElementById('modeUsaha').value;
    const fiturProduk = document.getElementById('menuProduk').checked;
    const fiturLaporan = document.getElementById('menuLaporan').checked;

    localStorage.setItem('namaToko', namaToko);
    localStorage.setItem('modeUsaha', modeUsaha);
    localStorage.setItem('fiturKasir', true);
    localStorage.setItem('fiturProduk', fiturProduk);
    localStorage.setItem('fiturLaporan', fiturLaporan);

    alert('Pengaturan Berhasil Disimpan!');
    window.location.href = 'index.html';
}

// FUNGSI BARU: AMBIL DATA BERDASARKAN MODE
function getProdukByMode() {
    const database = JSON.parse(localStorage.getItem('databaseProduk')) || [];
    const modeUsaha = localStorage.getItem('modeUsaha') || "Retail";
    const tipeTarget = modeUsaha === "Jasa" ? "jasa" : "produk";
    return database.filter(item => item.tipe === tipeTarget);
}

// Inisialisasi Data saat DOM Selesai Dimuat
document.addEventListener("DOMContentLoaded", function() {
    const namaTokoElement = document.getElementById('displayNamaToko');
    if (namaTokoElement) {
        const namaToko = localStorage.getItem('namaToko') || "NUSAPOS Universal";
        const modeUsaha = localStorage.getItem('modeUsaha') || "Retail";
        const fiturProduk = localStorage.getItem('fiturProduk') !== "false";
        const fiturLaporan = localStorage.getItem('fiturLaporan') !== "false";

        namaTokoElement.innerText = namaToko;
        document.getElementById('displayModeUsaha').innerText = `Mode Usaha: ${modeUsaha}`;

        renderMenuDinamis(modeUsaha, fiturProduk, fiturLaporan);
        renderPilihanProdukKasir();
        renderTabelProduk();
        renderLaporanPenjualan();
        cekModeStok();
    }
});

// FUNGSI BARU: RENDER MENU DINAMIS + MENU KUSTOM
function renderMenuDinamis(modeUsaha, fiturProduk, fiturLaporan) {
    const containerMenu = document.getElementById('menuDinamis');
    let html = `<button class="btn btn-kasir" onclick="bukaFitur('kasir')">🛒 Masuk Kasir (${modeUsaha})</button>`;

    if (fiturProduk) {
        html += `<button class="btn btn-aksen" onclick="bukaFitur('produk')">📦 Kelola Produk & Jasa</button>`;
    }
    if (fiturLaporan) {
        html += `<button class="btn btn-aksen" onclick="bukaFitur('laporan')">📊 Lihat Laporan Penjualan</button>`;
    }

    menuKustom.forEach((menu, index) => {
        html += `<button class="btn btn-outline" onclick="alert('Halaman ${menu.nama} - Konten bisa kamu isi nanti')">${menu.icon} ${menu.nama}</button>`;
    });

    html += `<a href="setting.html" class="btn btn-outline">⚙️ Pengaturan Halaman</a>`;
    containerMenu.innerHTML = html;
}

// Sistem Navigasi Single Page Dinamis
function bukaFitur(namaFitur) {
    document.getElementById('layarUtama').style.display = 'none';
    document.getElementById('layarKasir').style.display = 'none';
    document.getElementById('layarProduk').style.display = 'none';
    document.getElementById('layarLaporan').style.display = 'none';

    if (namaFitur === 'dashboard') {
        document.getElementById('layarUtama').style.display = 'block';
    } else if (namaFitur === 'kasir') {
        document.getElementById('layarKasir').style.display = 'block';
        renderPilihanProdukKasir();
    } else if (namaFitur === 'produk') {
        document.getElementById('layarProduk').style.display = 'block';
        renderTabelProduk();
        cekModeStok();
    } else if (namaFitur === 'laporan') {
        document.getElementById('layarLaporan').style.display = 'block';
        renderLaporanPenjualan();
    }
}

// FUNGSI BARU: AUTO HIDE/SHOW STOK BERDASARKAN MODE
function cekModeStok() {
    const modeUsaha = localStorage.getItem('modeUsaha') || "Retail";
    const inputStok = document.getElementById('prodStok');
    if(inputStok) {
        if(modeUsaha === "Jasa") {
            inputStok.value = 0;
            inputStok.disabled = true;
            inputStok.placeholder = "Mode Jasa - Stok Nonaktif";
        } else {
            inputStok.disabled = false;
            inputStok.placeholder = "Jumlah Stok Fisik";
        }
    }
}

// ==================== ENGINE KELOLA PRODUK & JASA ====================
function ambilDataProduk() {
    return JSON.parse(localStorage.getItem('databaseProduk')) || [];
}

function simpanProduk() {
    const nama = document.getElementById('prodNama').value.trim();
    const harga = parseFloat(document.getElementById('prodHarga').value) || 0;
    const stok = parseInt(document.getElementById('prodStok').value) || 0;
    const modeUsaha = localStorage.getItem('modeUsaha') || "Retail";
    const tipe = modeUsaha === "Jasa" ? "jasa" : "produk";

    if (!nama || harga <= 0) {
        alert("Nama produk dan harga harus diisi dengan benar!");
        return;
    }

    let database = ambilDataProduk();
    const produkBaru = {
        id: Date.now(),
        nama: nama,
        harga: harga,
        stok: tipe === "jasa" ? "-" : stok,
        tipe: tipe
    };

    database.push(produkBaru);
    localStorage.setItem('databaseProduk', JSON.stringify(database));
    
    document.getElementById('formProduk').reset();
    renderTabelProduk();
    alert("Produk/Jasa berhasil ditambahkan!");
}

function hapusProduk(id) {
    if (confirm("Hapus item ini?")) {
        let database = ambilDataProduk();
        database = database.filter(item => item.id !== id);
        localStorage.setItem('databaseProduk', JSON.stringify(database));
        renderTabelProduk();
    }
}

function renderTabelProduk() {
    const database = getProdukByMode();
    const tbody = document.getElementById('tabelProdukBody');
    if(!tbody) return;
    
    tbody.innerHTML = "";
    if(database.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#7292bf;">Belum ada data. Silakan tambah di atas.</td></tr>`;
        return;
    }

    database.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${item.nama}</strong> <small style="color:#17b7be;">[${item.tipe}]</small></td>
                <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
                <td>${item.stok}</td>
                <td><button onclick="hapusProduk(${item.id})" style="background:#dc3545; color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer;">X</button></td>
            </tr>
        `;
    });
}

// ==================== ENGINE MESIN KASIR ====================
function renderPilihanProdukKasir() {
    const database = getProdukByMode();
    const select = document.getElementById('kasirPilihProduk');
    if(!select) return;

    select.innerHTML = `<option value="">-- Pilih Produk/Jasa --</option>`;
    database.forEach(item => {
        const infoStok = item.stok !== "-" ? ` (Stok: ${item.stok})` : "";
        select.innerHTML += `<option value="${item.id}">${item.nama} - Rp ${item.harga.toLocaleString('id-ID')}${infoStok}</option>`;
    });
}

function tambahKeKeranjang() {
    const select = document.getElementById('kasirPilihProduk');
    const idTerpilih = parseFloat(select.value);
    if (!idTerpilih) return;

    const database = ambilDataProduk();
    const produk = database.find(item => item.id === idTerpilih);

    if (produk) {
        if (produk.stok !== "-" && produk.stok <= 0) {
            alert("Stok barang habis!");
            select.value = "";
            return;
        }

        const itemKeranjang = keranjangBelanja.find(item => item.id === idTerpilih);
        if (itemKeranjang) {
            if (produk.stok !== "-" && itemKeranjang.qty >= produk.stok) {
                alert("Tidak bisa menambah melebihi stok!");
                select.value = "";
                return;
            }
            itemKeranjang.qty++;
        } else {
            keranjangBelanja.push({ id: produk.id, nama: produk.nama, harga: produk.harga, qty: 1 });
        }
        renderKeranjang();
        select.value = "";
    }
}

function renderKeranjang() {
    const tbody = document.getElementById('keranjangBody');
    let total = 0;
    tbody.innerHTML = "";

    keranjangBelanja.forEach(item => {
        const subtotal = item.harga * item.qty;
        total += subtotal;
        tbody.innerHTML += `<tr><td>${item.nama} x ${item.qty}</td><td style="text-align:right;">Rp ${subtotal.toLocaleString('id-ID')}</td></tr>`;
    });

    document.getElementById('kasirTotalBelanja').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function prosesTransaksi() {
    if (keranjangBelanja.length === 0) { alert("Keranjang masih kosong!"); return; }

    const modeUsaha = localStorage.getItem('modeUsaha') || "Retail";
    let databaseProduk = ambilDataProduk();
    let totalBelanja = 0;

    if (modeUsaha === "Retail") {
        for (let item of keranjangBelanja) {
            let prod = databaseProduk.find(p => p.id === item.id);
            if (prod && prod.stok !== "-") { prod.stok -= item.qty; }
        }
        localStorage.setItem('databaseProduk', JSON.stringify(databaseProduk));
    }

    keranjangBelanja.forEach(item => totalBelanja += (item.harga * item.qty));
    const waktuSekarang = new Date().toLocaleString('id-ID');

    let laporan = JSON.parse(localStorage.getItem('databaseLaporan')) || [];
    laporan.push({ idTransaksi: "TRX-" + Date.now(), tanggal: waktuSekarang, total: totalBelanja, detail: keranjangBelanja });
    localStorage.setItem('databaseLaporan', JSON.stringify(laporan));

    document.getElementById('strukNamaToko').innerText = localStorage.getItem('namaToko') || "NUSAPOS";
    document.getElementById('strukWaktu').innerText = waktuSekarang;
    document.getElementById('strukTotal').innerText = `Rp ${totalBelanja.toLocaleString('id-ID')}`;

    const tabelStruk = document.getElementById('strukTabelItem');
    tabelStruk.innerHTML = "";
    keranjangBelanja.forEach(item => {
        tabelStruk.innerHTML += `<tr><td style="padding:4px 0; color:black;">${item.nama} (x${item.qty})</td><td style="text-align:right; padding:4px 0; color:black;">Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</td></tr>`;
    });

    document.getElementById('areaStruk').style.display = 'block';
    alert("Transaksi Sukses! Nota struk belanja telah dibuat di bawah.");
}

function aksiCetakStruk() {
    window.print();
    keranjangBelanja = [];
    renderKeranjang();
    document.getElementById('areaStruk').style.display = 'none';
    bukaFitur('dashboard');
}

// ==================== ENGINE LAPORAN PENJUALAN ====================
function renderLaporanPenjualan() {
    const laporan = JSON.parse(localStorage.getItem('databaseLaporan')) || [];
    const divLaporan = document.getElementById('isiLaporan');
    if(!divLaporan) return;

    divLaporan.innerHTML = "";
    let grandTotal = 0;

    if (laporan.length === 0) {
        divLaporan.innerHTML = `<p style="text-align:center; color:#7292bf;">Belum ada riwayat transaksi penjualan.</p>`;
        document.getElementById('grandTotalLaporan').innerText = "Rp 0";
        return;
    }

    laporan.forEach(trx => {
        grandTotal += trx.total;
        let detailHtml = trx.detail.map(d => `${d.nama} (${d.qty})`).join(', ');
        divLaporan.innerHTML += `
            <div style="background:#0f2d59; padding:10px; border-radius:8px; margin-bottom:10px; font-size:13px; border-left: 3px solid #17b7be;">
                <strong>${trx.idTransaksi}</strong> <span style="float:right; color:#17b7be;">Rp ${trx.total.toLocaleString('id-ID')}</span><br>
                <small style="color:#7292bf;">${trx.tanggal}</small><br>
                <span style="font-size:12px; color:#ffffff;">Item: ${detailHtml}</span>
            </div>
        `;
    });

    document.getElementById('grandTotalLaporan').innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;
}

function hapusSemuaData() {
    if (confirm("⚠️ PERINGATAN: Ini akan menghapus seluruh data produk dan riwayat laporan toko Anda. Lanjutkan?")) {
        localStorage.removeItem('databaseProduk');
        localStorage.removeItem('databaseLaporan');
        alert("Semua data berhasil dibersihkan!");
        window.location.reload();
    }
}

// FUNGSI BARU: TAMBAH HALAMAN KUSTOM
function tambahHalamanKustom() {
    const nama = document.getElementById('namaHalamanBaru').value.trim();
    const icon = document.getElementById('iconHalamanBaru').value.trim() || "📄";
    if(!nama) { alert("Nama halaman wajib diisi"); return; }
    if(menuKustom.length >= 5) { alert("Maksimal 5 halaman kustom"); return; }
    
    menuKustom.push({nama: nama, icon: icon});
    localStorage.setItem('menuKustom', JSON.stringify(menuKustom));
    alert(`Halaman ${nama} berhasil ditambahkan!`);
    document.getElementById('namaHalamanBaru').value = "";
    document.getElementById('iconHalamanBaru').value = "";
}
