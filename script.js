// ===================== LOAD DASHBOARD =====================
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

  values.forEach(row => {
    const [nama, kode, stok, belum] = row;
    if (!nama || !kode) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${nama}</h3>
      <p><b>Kode Material: ${kode}</b></p>
      <p style="color:green; font-size:1.3em; font-weight:bold;">Stok: ${stok}</p>
      <p style="color:red; font-size:1.3em; font-weight:bold;">Belum Datang: ${belum}</p>
    `;
    card.onclick = () => {
      console.log("Klik material:", nama, "Kode:", kode);
      window.location.href = `detail.html?material=${encodeURIComponent(nama)}&kode=${encodeURIComponent(kode)}`;
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

  values.forEach(row => {
    const [nama, kode, jumlah] = row;
    if (!nama || !kode || jumlah <= 0) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${nama}</h3>
      <p><b>Kode Material: ${kode}</b></p>
      <p style="color:red; font-size:1.6em; font-weight:bold;">${jumlah}</p>
    `;
    card.onclick = () => {
      // Tambahkan parameter "tipe=kurang" untuk diarahkan ke detail kekurangan
      console.log("Klik material kurang:", nama, "Kode:", kode);
      window.location.href = `detail.html?material=${encodeURIComponent(nama)}&kode=${encodeURIComponent(kode)}&tipe=kurang`;
    };
    container.appendChild(card);
  });
}
