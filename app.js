// Database pake IndexedDB - gantinya SQLite
let db;
const request = indexedDB.open("NusaPOS", 1);

request.onupgradeneeded = (e) => {
  db = e.target.result;
  db.createObjectStore("barang", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = (e) => { db = e.target.result; }

function simpanBarang() {
  const nama = document.getElementById('nama').value;
  const harga = parseInt(document.getElementById('harga').value);
  const stok = parseInt(document.getElementById('stok').value);

  if(!nama || !harga || !stok) {
    alert("Isi semua data dulu!");
    return;
  }

  const tx = db.transaction("barang", "readwrite");
  tx.objectStore("barang").add({ nama, harga, stok });
  
  alert("Barang berhasil disimpan!");
  document.getElementById('nama').value = "";
  document.getElementById('harga').value = "";
  document.getElementById('stok').value = "";
}

function keKasir() {
  window.location.href = "kasir.html"; // nanti kita bikin
}