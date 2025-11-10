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

  // Ambil label dan data
  const labels = rows.slice(1).map(r => r[0]);
  const values = rows.slice(1).map(r => parseFloat(r[1]) || 0);

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: title,
        data: values,
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      onClick: async (e, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const materialName = labels[index];
          if (sheetName === "STOCK MATERIAL") {
            window.location.href = `detail.html?material=${encodeURIComponent(materialName)}`;
          }
        }
      },
    },
  });
}

// ================= FUNGSI DETAIL MATERIAL =================
async function showMaterialDetail(kodeMaterial) {
  const detailContainer = document.getElementById("detailContainer");
  detailContainer.innerHTML = `<p>🔄 Memuat detail untuk: <b>${kodeMaterial}</b>...</p>`;

  const rows = await fetchSheet(CONFIG.DETAIL_SHEET_NAME);

  const hasilFilter = rows.filter(row => row[5] && row[5].toString().includes(kodeMaterial));

  if (hasilFilter.length === 0) {
    detailContainer.innerHTML = `<p>⚠️ Tidak ada data ditemukan untuk kode <b>${kodeMaterial}</b>.</p>`;
    return;
  }

  let tabelHTML = `
    <h3>${kodeMaterial}</h3>
    <table border="1" cellspacing="0" cellpadding="6">
      <tr style="background:#f1f1f1;font-weight:bold;">
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

  hasilFilter.forEach(row => {
    tabelHTML += `
      <tr>
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
  const urlParams = new URLSearchParams(window.location.search);
  const material = urlParams.get("material");

  if (material) {
    showMaterialDetail(material);
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
