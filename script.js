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
  const kosongList = [];

  values.forEach(row => {
    const [nama, kode, stok, belum] = row;
    if (!nama || !kode) return;

    const stokVal = parseInt(stok) || 0;
    const belumVal = parseInt(belum) || 0;

    if (stokVal > 0 || belumVal > 0) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${nama}</h3>
        <p><b>Kode Material: ${kode}</b></p>
        <p style="color:green; font-size:1.3em; font-weight:bold;">Stok: ${stokVal}</p>
        <p style="color:red; font-size:1.3em; font-weight:bold;">Belum Datang: ${belumVal}</p>
      `;
      card.onclick = () => {
        window.location.href = `detail.html?material=${encodeURIComponent(nama)}&kode=${encodeURIComponent(kode)}`;
      };
      container.appendChild(card);
    } else {
      kosongList.push({ nama, kode });
    }
  });

  const btnKosong = document.createElement("button");
  btnKosong.textContent = "🔍 Lihat Material Kosong";
  btnKosong.style = "margin-top:20px; padding:10px 20px; display:block; margin:auto;";
  btnKosong.onclick = () => {
    sessionStorage.setItem("kosongData", JSON.stringify(kosongList));
    window.location.href = "kosong.html?type=stockMaterial";
  };
  container.appendChild(btnKosong);
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
  const kosongList = [];

  values.forEach(row => {
    const [nama, kode, jumlah] = row;
    if (!nama || !kode) return;

    const jumlahVal = parseInt(jumlah) || 0;

    if (jumlahVal > 0) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${nama}</h3>
        <p><b>Kode: ${kode}</b></p>
        <p style="color:red; font-size:1.6em; font-weight:bold;">${jumlahVal}</p>
      `;
      container.appendChild(card);
    } else {
      kosongList.push({ nama, kode });
    }
  });

  const btnKosong = document.createElement("button");
  btnKosong.textContent = "🔍 Lihat Material Kosong";
  btnKosong.style = "margin-top:20px; padding:10px 20px; display:block; margin:auto;";
  btnKosong.onclick = () => {
    sessionStorage.setItem("kosongData", JSON.stringify(kosongList));
    window.location.href = "kosong.html?type=materialKurang";
  };
  container.appendChild(btnKosong);
}
