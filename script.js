// =============================================
// SCRIPT.JS FINAL VERSION
// Dashboard Monitoring Material PLN
// =============================================

// ---------------- CONFIGURASI ----------------
// Pastikan file config.js sudah di-load sebelum script ini
// dan berisi:
// const CONFIG = { API_KEY: "xxx", SHEET_ID: "xxx" };

// ---------------- DASHBOARD UTAMA ----------------
function loadDashboard(type) {
  const chartContainer = document.getElementById("chartContainer");
  chartContainer.innerHTML = `<div class="loading">⏳ Memuat data...</div>`;

  if (type === "daftarTunggu") loadDaftarTunggu();
  else if (type === "stockMaterial") loadStockMaterial();
  else if (type === "materialKurang") loadMaterialKurang();
}

// ---------------- 1️⃣ DAFTAR TUNGGU ----------------
async function loadDaftarTunggu() {
  const range = "DAFTAR TUNGGU!A2:G";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const values = data.values || [];

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Unit</th>
            <th>Nama Material</th>
            <th>Kode Material</th>
            <th>Jumlah</th>
            <th>Status</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
    `;

    values.forEach((r, i) => {
      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${r[0] || "-"}</td>
          <td>${r[1] || "-"}</td>
          <td>${r[2] || "-"}</td>
          <td>${r[3] || "-"}</td>
          <td>${r[4] || "-"}</td>
          <td>${r[5] || "-"}</td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    document.getElementById("chartContainer").innerHTML = html;
  } catch (err) {
    console.error("Gagal memuat daftar tunggu:", err);
    document.getElementById("chartContainer").innerHTML =
      `<p class="error">Gagal memuat data Daftar Tunggu.</p>`;
  }
}

// ---------------- 2️⃣ STOCK MATERIAL ----------------
async function loadStockMaterial() {
  const range = "STOCK MATERIAL!A2:H";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const values = data.values || [];

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Kode Material</th>
            <th>Nama Material</th>
            <th>Stok</th>
            <th>Satuan</th>
            <th>Gudang</th>
            <th>Update Terakhir</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
    `;

    values.forEach((r, i) => {
      const kode = r[1] || "-";
      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${kode}</td>
          <td>${r[2] || "-"}</td>
          <td>${r[3] || "-"}</td>
          <td>${r[4] || "-"}</td>
          <td>${r[5] || "-"}</td>
          <td>${r[6] || "-"}</td>
          <td><button onclick="openDetail('${kode}')">Lihat</button></td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    document.getElementById("chartContainer").innerHTML = html;
  } catch (err) {
    console.error("Gagal memuat stock material:", err);
    document.getElementById("chartContainer").innerHTML =
      `<p class="error">Gagal memuat data Stock Material.</p>`;
  }
}

// ---------------- 3️⃣ MATERIAL KURANG ----------------
async function loadMaterialKurang() {
  const range = "MATERIAL KURANG!A2:E";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const values = data.values || [];

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Kode Material</th>
            <th>Nama Material</th>
            <th>Stok Sekarang</th>
            <th>Kebutuhan</th>
          </tr>
        </thead>
        <tbody>
    `;

    values.forEach((r, i) => {
      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${r[0] || "-"}</td>
          <td>${r[1] || "-"}</td>
          <td>${r[2] || "-"}</td>
          <td>${r[3] || "-"}</td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    document.getElementById("chartContainer").innerHTML = html;
  } catch (err) {
    console.error("Gagal memuat material kurang:", err);
    document.getElementById("chartContainer").innerHTML =
      `<p class="error">Gagal memuat data Material Kurang.</p>`;
  }
}

// ---------------- DETAIL LINK ----------------
function openDetail(kode) {
  window.location.href = `detail.html?type=stockMaterial&kode=${kode}`;
}

// ---------------- 4️⃣ DETAIL STOCK MATERIAL ----------------
async function loadDetailStockMaterial(kode) {
  const range = "DETAIL STOCK MATERIAL!A2:Q"; // ✅ Ambil dari kolom A agar kolom F bisa terbaca
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const values = data.values || [];

    const tbody = document.querySelector("#detailTable tbody");
    const thead = document.querySelector("#tableHeader");

    document.getElementById("judulUtama").textContent = "Detail Stock Material";
    document.getElementById("subJudul").textContent = `Kode: ${kode}`;
    tbody.innerHTML = "";

    thead.innerHTML = `
      <th>No</th>
      <th>Nomor SPB</th>
      <th>Vendor Pelaksana</th>
      <th>Awal</th>
      <th>Akhir</th>
      <th>Jumlah SPB</th>
      <th>Jumlah Diterima</th>
      <th>Tgl Terima</th>
      <th>Nilai SPB</th>
    `;

    let no = 1;
    values.forEach(r => {
      if (r.length > 5 && r[5]?.toString().trim() === kode.toString().trim()) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${no++}</td>
          <td>${r[1] || "-"}</td>
          <td>${r[2] || "-"}</td>
          <td>${r[3] || "-"}</td>
          <td>${r[4] || "-"}</td>
          <td>${r[8] || "-"}</td>
          <td>${r[9] || "-"}</td>
          <td>${r[10] || "-"}</td>
          <td>${r[16] || "-"}</td>
        `;
        tbody.appendChild(tr);
      }
    });

    if (no === 1) {
      tbody.innerHTML = `
        <tr><td colspan="9" style="text-align:center; color:red;">
          Tidak ditemukan data untuk kode ${kode}
        </td></tr>`;
    }

  } catch (err) {
    console.error("Gagal memuat detail stock material:", err);
  }
}
