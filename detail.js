async function loadDetail() {
  const params = new URLSearchParams(window.location.search);
  const kategori = params.get("kategori");
  const material = params.get("material");
  const kode = params.get("kode");

  const judul = document.getElementById("judulUtama");
  const sub = document.getElementById("subJudul");
  const tbody = document.querySelector("#detailTable tbody");
  const thead = document.querySelector("#tableHeader");
  tbody.innerHTML = "";

  // DETAIL DAFTAR TUNGGU
  if (kategori) {
    judul.textContent = kategori;
    sub.textContent = "Daftar Pelanggan";
    const range = "DAFTAR TUNGGU!A2:L3145";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const values = data.values || [];

    thead.innerHTML = `
      <tr>
        <th>No</th><th>ULP</th><th>Bulan</th><th>Prioritas</th>
        <th>Tarif</th><th>Daya Lama</th><th>Daya Baru</th><th>Jumlah Pelanggan</th>
      </tr>
    `;

    let no = 1;
    values.forEach(r => {
      if (r[11] === kategori) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${no++}</td>
          <td>${r[2] || ''}</td>
          <td>${r[3] || ''}</td>
          <td>${r[4] || ''}</td>
          <td>${r[6] || ''}</td>
          <td>${r[7] || ''}</td>
          <td>${r[8] || ''}</td>
          <td>${r[9] || ''}</td>
        `;
        tbody.appendChild(tr);
      }
    });
  }

  // DETAIL STOCK MATERIAL
  if (material && kode) {
    judul.textContent = material;
    sub.textContent = `Kode: ${kode}`;
    const range = "DETAIL STOCK MATERIAL!A1:Q";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const values = data.values || [];

    thead.innerHTML = `
      <tr>
        <th>No</th><th>No SPB</th><th>Vendor</th><th>Awal</th><th>Akhir</th>
        <th>Jumlah</th><th>Jumlah Diterima</th><th>Tanggal Terima</th><th>Nilai SPB</th>
      </tr>
    `;

    let no = 1;
    values.forEach(row => {
      const kodeMaterial = row[5]; // kolom F = kode material
      if (kodeMaterial && kodeMaterial.trim() === kode.trim()) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${no++}</td>
          <td>${row[1] || ''}</td>
          <td>${row[2] || ''}</td>
          <td>${row[3] || ''}</td>
          <td>${row[4] || ''}</td>
          <td>${row[8] || ''}</td>
          <td>${row[9] || ''}</td>
          <td>${row[10] || ''}</td>
          <td>${row[16] || ''}</td>
        `;
        tbody.appendChild(tr);
      }
    });
  }
}

loadDetail();
