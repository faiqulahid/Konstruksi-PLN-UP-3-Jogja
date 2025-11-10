let data = []; // pastikan data terdefinisi
let detailData = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadDashboard();
});

async function loadDashboard() {
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values`;
  
  // Ambil data utama untuk chart (misalnya dari sheet "STOCK MATERIAL")
  const stockRes = await fetch(`${base}/'STOCK MATERIAL'?key=${CONFIG.API_KEY}`);
  const stockJson = await stockRes.json();
  data = stockJson.values || [];

  // Ambil detail material dari sheet DETAIL STOCK MATERIAL
  const detailRes = await fetch(`${base}/'DETAIL STOCK MATERIAL'?key=${CONFIG.API_KEY}`);
  const detailJson = await detailRes.json();
  detailData = detailJson.values || [];

  renderChart();
}

// ---- Render Chart ----
function renderChart() {
  if (!data || data.length < 2) {
    console.error("Data utama kosong");
    return;
  }

  const labels = data.slice(1).map(row => row[0]); // kolom A = nama material
  const values = data.slice(1).map(row => Number(row[1] || 0)); // kolom B = stok atau jumlah

  const ctx = document.getElementById("stockChart");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Jumlah Stock",
        data: values,
        backgroundColor: "#118ab2"
      }]
    },
    options: {
      responsive: true,
      onClick: (evt, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const materialName = labels[index];
          showDetail(materialName);
        }
      }
    }
  });
}

// ---- Tampilkan Detail Berdasarkan Material ----
function showDetail(materialName) {
  const header = document.querySelector("header");
  const chart = document.getElementById("stockChart");
  const detailPage = document.getElementById("detailPage");
  const tbody = document.querySelector("#detailTable tbody");
  const nameEl = document.getElementById("materialName");
  const codeEl = document.getElementById("materialCode");

  // Sembunyikan chart, tampilkan detail
  chart.classList.add("hidden");
  detailPage.classList.remove("hidden");

  // Filter detail berdasarkan material
  const rows = detailData.filter(r => r[0] === materialName);

  nameEl.textContent = `Material: ${materialName}`;
  codeEl.textContent = rows.length > 0 ? `Kode: ${rows[0][5] || "-"}` : "Kode: -";

  // Hapus isi lama
  tbody.innerHTML = "";

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9">Tidak ada data detail</td></tr>`;
    return;
  }

  // Isi tabel
  rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
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
  });
}
