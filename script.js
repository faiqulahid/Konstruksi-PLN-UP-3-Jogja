// script.js (FINAL)
// Pastikan config.js ter-load sebelum file ini (CONFIG.SHEET_ID, CONFIG.API_KEY)

async function loadDashboard(type, ulp) {
  if (type === "daftarTunggu") await loadDaftarTunggu(ulp);
  else if (type === "stockMaterial") await loadStockMaterial();
  else if (type === "materialKurang") await loadMaterialKurang();
}

// ===================== DAFTAR TUNGGU =====================
async function loadDaftarTunggu(ulp) {
  // Jika tidak dikirim, ambil dari URL (opsional)
  const filterULP = ulp || new URLSearchParams(window.location.search).get("ulp");
  if (!filterULP) return;

  const range = "DAFTAR TUNGGU!A1:BS";
  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(apiUrl);
  const data = await res.json();
  const values = data.values || [];

  const headers = values[0]; // row header
  const rows = values.slice(1);

  const materialStart = 12; // kolom M
  const materialEnd = 71;   // kolom BS

  const tableBody = document.getElementById("tBody");
  tableBody.innerHTML = "";

  const filtered = rows.filter(r => r[2] === filterULP);

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:red;">⚠️ Tidak ada data Daftar Tunggu untuk '${filterULP}'.</td></tr>`;
    return;
  }

  filtered.forEach((r, idx) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${r[3] || ""}</td> <!-- Bulan -->
      <td>${r[4] || ""}</td> <!-- Prioritas -->
      <td>${r[5] || ""}</td> <!-- Nama Pelanggan -->
      <td>${r[6] || ""}</td> <!-- Tarif -->
      <td>${r[7] || ""}</td> <!-- Daya Lama -->
      <td>${r[8] || ""}</td> <!-- Daya Baru -->
      <td>${r[9] || ""}</td> <!-- Jumlah -->
      <td>${r[10] || ""}</td> <!-- Total Daya Baru -->
      <td>${r[11] || ""}</td> <!-- Klasifikasi -->
      <td style="text-align:center; cursor:pointer;"><button class="detail-btn">➜</button></td>
    `;

    const btn = tr.querySelector(".detail-btn");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      // cek apakah panel sudah ada
      const next = tr.nextElementSibling;
      if (next && next.classList.contains("material-panel")) {
        next.remove();
        btn.textContent = "➜";
        return;
      }

      // tutup panel lain
      document.querySelectorAll(".material-panel").forEach(p => p.remove());
      document.querySelectorAll(".detail-btn").forEach(b => b.textContent = "➜");
      btn.textContent = "▼";

      // buat row panel
      const panel = document.createElement("tr");
      panel.className = "material-panel";
      const td = document.createElement("td");
      td.colSpan = 11;
      td.style.padding = "12px";
      td.style.background = "#fafafa";

      // Info pelanggan
      const infoHTML = `
        <b>Nama Pelanggan:</b> ${r[5] || ""}<br>
        <b>Daya Lama:</b> ${r[7] || ""}<br>
        <b>Daya Baru:</b> ${r[8] || ""}<br>
        <b>Jumlah:</b> ${r[9] || ""}
        <hr>
      `;

      // Tabel material
      const tbl = document.createElement("table");
      tbl.style.width = "100%";
      tbl.style.borderCollapse = "collapse";
      tbl.innerHTML = `
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama Material</th>
            <th>Satuan</th>
            <th>Kebutuhan</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tbodyMat = tbl.querySelector("tbody");

      // ambil kode material M..BS
      for (let i = materialStart; i <= materialEnd; i++) {
        const kode = headers[i];
        const jumlah = r[i];
        if (!jumlah || jumlah == "0") continue;

        // opsi: nama & satuan bisa ambil dari sheet BAHAN jika diperlukan
        tbodyMat.innerHTML += `
          <tr>
            <td>${kode || ""}</td>
            <td>(Nama Material)</td>
            <td>(Satuan)</td>
            <td>${jumlah}</td>
          </tr>
        `;
      }

      td.innerHTML = infoHTML;
      td.appendChild(tbl);
      panel.appendChild(td);
      tr.parentNode.insertBefore(panel, tr.nextSibling);
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

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
    const hasStok = !isNaN(stokVal) && stokVal > 0;
    const hasBelum = !isNaN(belumVal) && belumVal > 0;

    if (hasStok || hasBelum) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${nama}</h3>
        <p><b>Kode Material: ${kode}</b></p>
        <p style="color:green; font-weight:bold;">Stok: ${hasStok ? stokVal : 0}</p>
        <p style="color:red; font-weight:bold;">Belum Datang: ${hasBelum ? belumVal : 0}</p>
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

    if (!isNaN(jumlahVal) && jumlahVal > 0) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${nama}</h3>
        <p><b>Kode: ${kode}</b></p>
        <p style="color:red; font-weight:bold;">${jumlahVal}</p>
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
  btnKosong.textContent = `🔍 Lihat Material Kosong (${kosongList.length})`;
  btnKosong.style = "margin-top:20px; padding:10px 20px; display:block; margin:auto;";
  btnKosong.onclick = () => {
    sessionStorage.setItem("kosongData", JSON.stringify(kosongList));
    window.location.href = "kosong.html?type=materialKurang";
  };
  container.appendChild(btnKosong);
}
