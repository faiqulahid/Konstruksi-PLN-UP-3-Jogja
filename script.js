// script.js (FINAL)
// Pastikan config.js ter-load sebelum file ini (CONFIG.SHEET_ID, CONFIG.API_KEY)

async function loadDashboard(type) {
  if (type === "daftarTunggu") await loadDaftarTunggu();
  else if (type === "stockMaterial") await loadStockMaterial();
  else if (type === "materialKurang") await loadMaterialKurang();
}

async function loadDetailDaftarTunggu() {
  const urlParams = new URLSearchParams(window.location.search);
  const ulp = urlParams.get("ulp");

  if (!ulp) return;

  const range = "DAFTAR TUNGGU!A1:BS";
  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(apiUrl);
  const data = await res.json();
  const values = data.values || [];

  const headers = values[0];
  const rows = values.slice(1);

  // Kolom material =  M (index 12) sampai BS (index 71)
  const materialStart = 12;
  const materialEnd = 71;

  const tableBody = document.getElementById("tBody");
  tableBody.innerHTML = "";

  // Filter berdasarkan ULP (kolom C = index 2)
  const filtered = rows.filter(r => r[2] === ulp);

  filtered.forEach(r => {
    const tr = document.createElement("tr");

    // Kolom-kolom utama
    tr.innerHTML = `
      <td>${r[0] || ""}</td>
      <td>${r[5] || ""}</td> 
      <td>${r[7] || ""}</td>
      <td>${r[8] || ""}</td>
      <td>${r[9] || ""}</td>
    `;

    // 🔽 Kolom untuk tombol pindah halaman
    const tdAction = document.createElement("td");
    tdAction.style.textAlign = "center";
    tdAction.style.cursor = "pointer";

    const idMaterial = r[12] || ""; // kolom M
    const namaPelanggan = r[5] || "";
    const dayaLama = r[7] || "";
    const dayaBaru = r[8] || "";
    const jumlahPlg = r[9] || "";

    tdAction.innerHTML = "➡️";

    // ⛔ Penting: hentikan event lama dari row/table
    tdAction.addEventListener("click", (e) => {
      e.stopPropagation(); // agar tidak memicu fitur expand lama
      
      window.location.href =
        `detail_material.html?id=${encodeURIComponent(idMaterial)}` +
        `&pelanggan=${encodeURIComponent(namaPelanggan)}` +
        `&dayaLama=${encodeURIComponent(dayaLama)}` +
        `&dayaBaru=${encodeURIComponent(dayaBaru)}` +
        `&jumlah=${encodeURIComponent(jumlahPlg)}`;
    });

    tr.appendChild(tdAction);

    tableBody.appendChild(tr);
  });
}

// ===================== STOCK MATERIAL =====================
async function loadStockMaterial() {
  const range = "STOCK MATERIAL!A2:D";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const values = data.values || [];

  const container = document.getElementById("chartContainer");
  container.innerHTML = "";
  const kosongList = [];

  values.forEach(row => {
    const [nama, kode, stok, belum] = row;
    if (!nama || !kode) return;

    const stokVal = Number(stok);
    const belumVal = Number(belum);

    // validasi: hanya tampilkan jika stok atau belum (arriving) ada > 0
    const hasStok = !isNaN(stokVal) && stokVal > 0;
    const hasBelum = !isNaN(belumVal) && belumVal > 0;

    if (hasStok || hasBelum) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${nama}</h3>
        <p><b>Kode Material: ${kode}</b></p>
        <p style="color:green; font-size:1.1em; font-weight:bold; margin:6px 0;">Stok: ${hasStok ? stokVal : 0}</p>
        <p style="color:red; font-size:1.1em; font-weight:bold; margin:6px 0;">Belum Datang: ${hasBelum ? belumVal : 0}</p>
      `;
      card.onclick = () => {
        window.location.href = `detail.html?material=${encodeURIComponent(nama)}&kode=${encodeURIComponent(kode)}`;
      };
      container.appendChild(card);
    } else {
      // stok/jumlah tidak valid atau = 0 -> dianggap kosong
      kosongList.push({ nama, kode });
    }
  });

  // Tombol lihat material kosong + indikator jumlah
  const btnKosong = document.createElement("button");
  btnKosong.textContent = `🔍 Lihat Material Kosong (${kosongList.length})`;
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
  const res = await fetch(url);
  const data = await res.json();
  const values = data.values || [];

  const container = document.getElementById("chartContainer");
  container.innerHTML = "";
  const kosongList = [];

  values.forEach(row => {
    const [nama, kode, jumlah] = row;
    if (!nama || !kode) return;

    const jumlahVal = Number(jumlah);

    // tampilkan hanya jika jumlah > 0 (butuh material)
    if (!isNaN(jumlahVal) && jumlahVal > 0) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${nama}</h3>
        <p><b>Kode: ${kode}</b></p>
        <p style="color:red; font-size:1.2em; font-weight:bold; margin:6px 0;">${jumlahVal}</p>
      `;
      // penting: arahkan ke detail dengan material & kode
      card.onclick = () => {
        window.location.href = `detail.html?material=${encodeURIComponent(nama)}&kode=${encodeURIComponent(kode)}`;
      };
      container.appendChild(card);
    } else {
      kosongList.push({ nama, kode });
    }
  });

  const btnKosong = document.createElement("button");
  btnKosong.textContent = `🔍 Lihat Material Kosong (${kosongList.length})`;
  btnKosong.style = "margin-top:20px; padding:10px 20px; display:block; margin:auto;";
  btnKosong.onclick = () => {
    sessionStorage.setItem("kosongData", JSON.stringify(kosongList));
    window.location.href = "kosong.html?type=materialKurang";
  };
  container.appendChild(btnKosong);
}
