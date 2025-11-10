async function loadDashboard(type) {
  if (type === "daftarTunggu") loadDaftarTunggu();
  else if (type === "stockMaterial") loadStockMaterial();
  else if (type === "materialKurang") loadMaterialKurang();
}

// ===================== DAFTAR TUNGGU =====================
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
      window.location.href = `detail.html?kategori=${encodeURIComponent(kategori)}`;
    };
    container.appendChild(card);
  });
}

// ===================== STOCK MATERIAL =====================
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
    const [no, kode, nama, stok] = row;
    if (!kode || !nama) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${nama}</h3>
      <p><b>Kode: ${kode}</b></p>
      <p style="color:green; font-size:1.3em; font-weight:bold;">Stok: ${stok || 0}</p>
    `;
    card.onclick = () => {
      // kirim KODE MATERIAL ke detail.html
      window.location.href = `detail.html?kode=${encodeURIComponent(kode)}&nama=${encodeURIComponent(nama)}`;
    };
    container.appendChild(card);
  });
}

// ===================== MATERIAL KURANG =====================
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
    if (!nama || jumlah <= 0) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${nama}</h3>
      <p><b>${kode}</b></p>
      <p style="color:red; font-size:1.6em; font-weight:bold;">${jumlah}</p>
    `;
    container.appendChild(card);
  });
}
