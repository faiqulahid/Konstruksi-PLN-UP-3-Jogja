// ========== CONFIG SPREADSHEET ========== //
const SPREADSHEET_ID = "1Ch1QiJIZaX1Nr4zHdbuNYPlzeLPdHJabHTJ_ZFXs82w";
const API_KEY = "YOUR_API_KEY"; // ganti dengan API key-mu
const SHEET_DETAIL = "DETAIL STOCK MATERIAL";

// ========== AMBIL PARAMETER DARI URL ========== //
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const kodeMaterial = urlParams.get("kode");
  const namaMaterial = urlParams.get("nama");

  if (kodeMaterial && namaMaterial) {
    await showMaterialDetail(kodeMaterial, namaMaterial);
  }
});

// ========== FUNGSI UTAMA UNTUK MENAMPILKAN DETAIL ========== //
async function showMaterialDetail(kodeMaterial, namaMaterial) {
  const container = document.getElementById("detailContainer");
  container.innerHTML = `<p>🔄 Memuat data...</p>`;

  try {
    // Ambil data dari Google Sheet
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_DETAIL}?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const rows = data.values || [];

    console.log("DETAIL STOCK MATERIAL rows fetched:", rows.length);

    // Header kolom (baris pertama)
    const header = rows[0];
    const body = rows.slice(1);

    // Index kolom
    const colKode = 1; // kolom B = Kode Material
    const colNoSPB = 1;
    const colVendor = 2;
    const colAwal = 3;
    const colAkhir = 4;
    const colJumlah = 8;
    const colJumlahTerima = 9;
    const colTglTerima = 10;
    const colNilaiSPB = 16;

    // Filter baris berdasarkan kode material
    const hasilFilter = body.filter(r => (r[colKode] || "").toString().trim() === kodeMaterial.trim());

    console.log(`Ditemukan ${hasilFilter.length} baris untuk kode ${kodeMaterial}`);

    // ========== BANGUN TAMPILAN HTML ========== //
    let html = `
      <div style="text-align:center; margin-bottom:20px;">
        <h2 style="color:#0056b3;">⚡ DETAIL MATERIAL PLN ⚡</h2>
        <p><b>${kodeMaterial}</b></p>
        <p>Kode: ${namaMaterial}</p>
        <button onclick="window.location.href='index.html'" style="
          background-color:#007bff;
          color:white;
          border:none;
          padding:10px 20px;
          border-radius:8px;
          cursor:pointer;
        ">← Kembali ke Dashboard</button>
      </div>
    `;

    if (hasilFilter.length === 0) {
      html += `
        <table border="1" style="width:100%; border-collapse:collapse;">
          <thead style="background-color:#0056b3; color:white;">
            <tr>
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
          </thead>
          <tbody>
            <tr><td colspan="9" style="color:red; text-align:center; padding:10px;">
              ⚠️ Tidak ada data ditemukan untuk kode ${namaMaterial}
            </td></tr>
          </tbody>
        </table>
      `;
    } else {
      html += `
        <table border="1" style="width:100%; border-collapse:collapse;">
          <thead style="background-color:#0056b3; color:white;">
            <tr>
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
          </thead>
          <tbody>
      `;

      hasilFilter.forEach((row, idx) => {
        html += `
          <tr>
            <td>${idx + 1}</td>
            <td>${row[colNoSPB] || ""}</td>
            <td>${row[colVendor] || ""}</td>
            <td>${row[colAwal] || ""}</td>
            <td>${row[colAkhir] || ""}</td>
            <td>${row[colJumlah] || ""}</td>
            <td>${row[colJumlahTerima] || ""}</td>
            <td>${row[colTglTerima] || ""}</td>
            <td>${row[colNilaiSPB] || ""}</td>
          </tr>
        `;
      });

      html += "</tbody></table>";
    }

    container.innerHTML = html;
  } catch (err) {
    console.error("Error:", err);
    container.innerHTML = `<p style="color:red;">❌ Gagal memuat data.</p>`;
  }
}
