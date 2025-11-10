// ================= CONFIGURASI =================
const SHEET_BASE = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json`;

// ================= FUNGSI FETCH DATA =================
async function fetchSheet(sheetName) {
  const response = await fetch(`${SHEET_BASE}&sheet=${encodeURIComponent(sheetName)}`);
  const text = await response.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));
  return json.table.rows.map(r => r.c.map(c => (c ? c.v : "")));
}

// ================= FUNGSI CHART =================
let chartInstance;

async function showChart(sheetName, title) {
  const ctx = document.getElementById("mainChart").getContext("2d");
  const rows = await fetchSheet(sheetName);

  if (chartInstance) chartInstance.destroy();

  const labels = rows.slice(1).map(r => r[1]); // kolom B = nama material
  const codes = rows.slice(1).map(r => r[0]); // kolom A = kode material
  const stokValues = rows.slice(1).map(r => parseFloat(r[2]) || 0);

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: title,
        data: stokValues,
        backgroundColor: "#007bff"
      }],
    },
    options: {
      responsive: true,
      onClick: async (e, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const kode = codes[index];
          const nama = labels[index];
          window.location.href = `detail.html?kode=${encodeURIComponent(kode)}&nama=${encodeURIComponent(nama)}`;
        }
      },
    },
  });
}

// ================= FUNGSI DETAIL MATERIAL =================
async function showMaterialDetail(kodeMaterial, namaMaterial) {
  const detailContainer = document.getElementById("detailContainer");
  detailContainer.innerHTML = `<p>🔄 Memuat detail untuk: <b>${kodeMaterial}</b>...</p>`;

  const rows = await fetchSheet(CONFIG.DETAIL_SHEET_NAME);
  const hasilFilter = rows.filter(row => row[5] && row[5].toString().trim() === kodeMaterial.trim());

  if (hasilFilter.length === 0) {
    detailContainer.innerHTML = `
      <h2>${kodeMaterial}</h2>
      <h3>Kode: ${namaMaterial}</h3>
      <table border="1" cellspacing="0" cellpadding="6">
        <tr style="background:#007AC3; color:white;">
          <th>No</th>
          <th>No SPB (B)</th>
          <th>Vendor (C)</th>
          <th>Awal (D)</th>
          <th>Akhir (E)</th>
          <th>Jumlah (I)</th>
          <th>Jumlah Diterima (J)</th>
          <th>Tanggal Terima (K)</th>
          <th>Nilai SPB (Q)</th>
        </tr>
        <tr><td colspan="9" style="color:red; text-align:center;">⚠️ Tidak ada data ditemukan untuk kode ${namaMaterial}</td></tr>
      </table>
    `;
    return;
  }

  let tabelHTML = `
    <h2>${kodeMaterial}</h2>
    <h3>Kode: ${namaMaterial}</h3>
    <a href="index.html" class="back-btn">⬅ Kembali ke Dashboard</a>
    <table border="1" cellspacing="0" cellpadding="6">
      <tr style="background:#007AC3; color:white;">
        <th>No</th>
        <th>No SPB (B)</th>
        <th>Vendor (C)</th>
        <th>Awal (D)</th>
        <th>Akhir (E)</th>
        <th>Jumlah (I)</th>
        <th>Jumlah Diterima (J)</th>
        <th>Tanggal Terima (K)</th>
        <th>Nilai SPB (Q)</th>
      </tr>
  `;

  hasilFilter.forEach((row, i) => {
    tabelHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${row[1] || "-"}</td>
        <td>${row[2] || "-"}</td>
        <td>${row[3] || "-"}</td>
        <td>${row[4] || "-"}</td>
        <td>${row[8] || "-"}</td>
        <td>${row[9] || "-"}</td>
        <td>${row[10] || "-"}</td>
        <td>${row[16] || "-"}</td>
      </tr>
    `;
  });

  tabelHTML += `</table>`;
  detailContainer.innerHTML = tabelHTML;
}

// ================= EVENT LISTENER =================
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const kode = params.get("kode");
  const nama = params.get("nama");

  if (kode && nama) {
    showMaterialDetail(kode, nama);
    return;
  }

  document.getElementById("daftarTungguBtn").addEventListener("click", () => {
    showChart("DAFTAR TUNGGU", "Daftar Tunggu");
  });

  document.getElementById("stockMaterialBtn").addEventListener("click", () => {
    showChart("STOCK MATERIAL", "Stock Material");
  });

  document.getElementById("kekuranganMaterialBtn").addEventListener("click", () => {
    showChart("KEKURANGAN MATERIAL", "Kekurangan Material");
  });

  // default tampilkan stok material
  showChart("STOCK MATERIAL", "Stock Material");
});
