// script.js - final
// Menggunakan CONFIG dari config.js (pastikan config.js ada dan berisi API_KEY & SHEET_ID)

async function loadDashboard(type) {
  if (type === "daftarTunggu") loadDaftarTunggu();
  else if (type === "stockMaterial") loadStockMaterial();
  else if (type === "materialKurang") loadMaterialKurang();
}

// ===================== DAFTAR TUNGGU (tetap seperti sekarang) =====================
async function loadDaftarTunggu() {
  const range = "DAFTAR TUNGGU!A1:L3145";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const values = data.values || [];

  const rows = values.slice(1);
  const kategoriCol = 11;
  const kategoriCount = {};
  rows.forEach(r => {
    const kategori = r[kategoriCol] || "Tidak Ada Kategori";
    kategoriCount[kategori] = (kategoriCount[kategori] || 0) + 1;
  });

  const container = document.getElementById("chartContainer");
  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(2, 1fr)";
  container.style.gap = "30px";

  Object.entries(kategoriCount).forEach(([kategori, jumlah]) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${kategori}</h3><p style="font-size:2em;font-weight:bold;color:#007AC3">${jumlah}</p>`;
    card.onclick = () => window.location.href = `detail.html?kategori=${encodeURIComponent(kategori)}`;
    container.appendChild(card);
  });
}

// ===================== STOCK MATERIAL (gunakan A-D, kirim kode dari kolom B) =====================
async function loadStockMaterial() {
  const range = "STOCK MATERIAL!A2:D";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const values = data.values || [];

  const container = document.getElementById("chartContainer");
  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(3, 1fr)";
  container.style.gap = "20px";

  values.forEach(row => {
    // Row layout: [A = nama, B = kode, C = stok, D = belum]
    const nama = row[0] || "";
    const kode = row[1] || "";
    const stok = row[2] || 0;
    const belum = row[3] || 0;

    if (!nama || !kode) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${escapeHtml(nama)}</h3>
      <p><b>Kode Material: ${escapeHtml(kode)}</b></p>
      <p style="color:green;font-size:1.1em;font-weight:bold;">${stok}</p>
      <p style="color:red;font-size:1.1em;font-weight:bold;">${belum}</p>
    `;

    // Kirim KODE (kolom B) dan nama (untuk tampilan) ke detail
    card.onclick = () => {
      window.location.href = `detail.html?kode=${encodeURIComponent(kode)}&nama=${encodeURIComponent(nama)}`;
    };

    container.appendChild(card);
  });
}

// ===================== MATERIAL KURANG =====================
async function loadMaterialKurang() {
  const range = "MATERIAL KURANG!A2:C";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const values = data.values || [];

  const container = document.getElementById("chartContainer");
  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(3, 1fr)";
  container.style.gap = "20px";

  values.forEach(row => {
    const nama = row[0] || "";
    const kode = row[1] || "";
    const jumlah = parseFloat(row[2] || 0);
    if (!nama || jumlah <= 0) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${escapeHtml(nama)}</h3>
      <p><b>${escapeHtml(kode)}</b></p>
      <p style="color:red;font-size:1.6em;font-weight:bold;">${jumlah}</p>
    `;
    container.appendChild(card);
  });
}

// helper kecil untuk keamanan teks
function escapeHtml(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// Jika halaman dimuat tanpa aksi, tampilkan stockMaterial sebagai default
document.addEventListener("DOMContentLoaded", () => {
  // Jika ada tombol/menu di HTML, user bisa klik. Default:
  loadStockMaterial();
});
