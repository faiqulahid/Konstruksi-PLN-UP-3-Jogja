async function loadDashboard(type) {
  const container = document.getElementById("chartContainer");
  container.innerHTML = "<p>Loading...</p>";

  let range = "";
  if (type === "daftarTunggu") range = "DAFTAR TUNGGU!A1:L3145";
  if (type === "stockMaterial") range = "STOCK MATERIAL!A1:D72";
  if (type === "materialKurang") range = "MATERIAL KURANG!A1:C74";

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const rows = data.values || [];

  container.innerHTML = "";

  if (type === "daftarTunggu") {
    const header = rows[0];
    const kategoriIndex = 11;
    const dataRows = rows.slice(1);
    const counts = {};

    dataRows.forEach(r => {
      const kategori = r[kategoriIndex] || "Tidak Diketahui";
      counts[kategori] = (counts[kategori] || 0) + 1;
    });

    Object.entries(counts).forEach(([kategori, jumlah]) => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `<h3>${kategori}</h3><p>${jumlah}</p>`;
      div.onclick = () => {
        window.location.href = `detail.html?kategori=${encodeURIComponent(kategori)}`;
      };
      container.appendChild(div);
    });
  }

  else if (type === "stockMaterial") {
    rows.slice(1).forEach(r => {
      const nama = r[0];
      const kode = r[1];
      const stok = r[2];
      const belum = r[3];

      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <h3>${nama}</h3>
        <small>${kode}</small>
        <p><span class="green">${stok}</span> | <span class="red">${belum}</span></p>
      `;
      container.appendChild(div);
    });
  }

  else if (type === "materialKurang") {
    rows.slice(1).forEach(r => {
      const nama = r[0];
      const kode = r[1];
      const jumlah = parseInt(r[2]) || 0;

      if (jumlah > 0) {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
          <h3>${nama}</h3>
          <small>${kode}</small>
          <p class="red">${jumlah}</p>
        `;
        container.appendChild(div);
      }
    });
  }
}
