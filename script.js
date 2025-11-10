// ================================ //
// 🔹 LOAD DASHBOARD MAIN BUTTONS 🔹 //
// ================================ //
async function loadDashboard(type) {
  if (type === "daftarTunggu") loadDaftarTunggu();
  else if (type === "stockMaterial") loadStockMaterial();
  else if (type === "materialKurang") loadMaterialKurang();
}

// ================================ //
// 1️⃣ DAFTAR TUNGGU (AMAN, TIDAK DIUBAH) //
// ================================ //
async function loadDaftarTunggu() {
  const range = "DAFTAR TUNGGU!A1:L3145";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
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
    card.innerHTML = `
      <h3>${kategori}</h3>
      <p style="font-size:2em; font-weight:bold; color:#007AC3;">${jumlah}</p>
    `;
    card.onclick = () => {
      window.location.href = `detail.html?type=daftarTunggu&kategori=${encodeURIComponent(kategori)}`;
    };
    container.appendChild(card);
  });
}

// ================================ //
// 2️⃣ STOCK MATERIAL //
// ================================ //
async function loadStockMaterial() {
  const range = "STOCK MATERIAL!A2:D";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  const values = data.values || [];

  const container = document.getElementById("chartContainer");
  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(3, 1fr)";
  container.style.gap = "20px";

  values.forEach(row => {
    const [nama, kode, stok, belum] = row;
    if (!kode) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${nama}</h3>
      <p><b>Kode: ${kode}</b></p>
      <p style="color:green; font-size:1.3em; font-weight:bold;">Stok: ${stok || 0}</p>
      <p style="color:red; font-size:1.3em; font-weight:bold;">Belum Datang: ${belum || 0}</p>
    `;
    card.onclick = () => {
      window.location.href = `detail.html?type=stockMaterial&kode=${encodeURIComponent(kode)}`;
    };
    container.appendChild(card);
  });
}

// ================================ //
// 3️⃣ MATERIAL KURANG //
// ================================ //
async function loadMaterialKurang() {
  const range = "MATERIAL KURANG!A2:C";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  const values = data.values || [];

  const container = document.getElementById("chartContainer");
  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(3, 1fr)";
  container.style.gap = "20px";

  values.forEach(row => {
    const [nama, kode, jumlah] = row;
    if (!kode || jumlah <= 0) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${nama}</h3>
      <p><b>Kode: ${kode}</b></p>
      <p style="color:red; font-size:1.6em; font-weight:bold;">${jumlah}</p>
    `;
    card.onclick = () => {
      window.location.href = `detail.html?type=materialKurang&kode=${encodeURIComponent(kode)}`;
    };
    container.appendChild(card);
  });
}

// ================================ //
// 4️⃣ DETAIL PAGE LOGIC //
// ================================ //
window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const kode = params.get("kode");
  const kategori = params.get("kategori");

  if (type === "daftarTunggu" && kategori) loadDetailDaftarTunggu(kategori);
  else if (type === "stockMaterial" && kode) loadDetailStockMaterial(kode);
  else if (type === "materialKurang" && kode) loadDetailMaterialKurang(kode);
});

// ---------- DETAIL: DAFTAR TUNGGU ----------
async function loadDetailDaftarTunggu(kategori) {
  const range = "DAFTAR TUNGGU!A2:L3145";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const values = data.values || [];
  const tbody = document.querySelector("#detailTable tbody");
  const thead = document.querySelector("#tableHeader");

  document.getElementById("judulUtama").textContent = kategori;
  document.getElementById("subJudul").textContent = "Daftar Pelanggan";

  thead.innerHTML = `
    <th>No</th><th>ULP</th><th>Bulan</th><th>Prioritas</th>
    <th>Tarif</th><th>Daya Lama</th><th>Daya Baru</th><th>Jumlah Pelanggan</th>
  `;
  tbody.innerHTML = "";

  let no = 1;
  values.forEach(r => {
    if (r[11] === kategori) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${no++}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td>
        <td>${r[6]}</td><td>${r[7]}</td><td>${r[8]}</td><td>${r[9]}</td>
      `;
      tbody.appendChild(tr);
    }
  });
}

// ---------- DETAIL: STOCK MATERIAL ----------
async function loadDetailStockMaterial(kode) {
  const range = "DETAIL STOCK MATERIAL!B2:Q";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const values = data.values || [];
  const tbody = document.querySelector("#detailTable tbody");
  const thead = document.querySelector("#tableHeader");

  document.getElementById("judulUtama").textContent = "Detail Stock Material";
  document.getElementById("subJudul").textContent = `Kode: ${kode}`;
  tbody.innerHTML = "";

  thead.innerHTML = `
    <th>No</th><th>Nomor SPB</th><th>Vendor Pelaksana</th><th>Awal</th>
    <th>Akhir</th><th>Jumlah SPB</th><th>Jumlah Diterima</th>
    <th>Tgl Terima</th><th>Nilai SPB</th>
  `;

  let no = 1;
  values.forEach(r => {
    if (r[5] && r[5].trim() === kode.trim()) {
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
}

// ---------- DETAIL: MATERIAL KURANG ----------
async function loadDetailMaterialKurang(kode) {
  const range = "DETAIL MATERIAL KURANG!A2:I";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const values = data.values || [];
  const tbody = document.querySelector("#detailTable tbody");
  const thead = document.querySelector("#tableHeader");

  document.getElementById("judulUtama").textContent = "Detail Material Kurang";
  document.getElementById("subJudul").textContent = `Kode: ${kode}`;
  tbody.innerHTML = "";

  thead.innerHTML = `
    <th>No</th><th>Nama Material</th><th>ULP</th><th>Bulan</th><th>Jumlah Kurang</th>
  `;

  let no = 1;
  values.forEach(r => {
    if (r[1] && r[1].trim() === kode.trim()) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${no++}</td>
        <td>${r[0] || "-"}</td>
        <td>${r[2] || "-"}</td>
        <td>${r[3] || "-"}</td>
        <td>${r[4] || "-"}</td>
      `;
      tbody.appendChild(tr);
    }
  });
}
