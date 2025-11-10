async function loadDashboard(type) {
  const container = document.getElementById("chartContainer");
  container.innerHTML = "<p style='text-align:center;'>⏳ Loading data...</p>";

  let range = "";
  let title = "";
  
  if (type === "daftarTunggu") {
    range = "DAFTAR TUNGGU!A1:L3145";
    title = "DAFTAR TUNGGU";
  } else if (type === "stockMaterial") {
    range = "STOCK MATERIAL!A1:D72";
    title = "STOCK MATERIAL";
  } else if (type === "materialKurang") {
    range = "MATERIAL KURANG!A1:C74";
    title = "MATERIAL KURANG";
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const values = data.values || [];

  container.innerHTML = `<h2 class="section-title">${title}</h2>`;
  const cardGrid = document.createElement("div");
  cardGrid.className = "card-container";

  if (type === "daftarTunggu") {
    const kategoriCounts = {};
    values.slice(1).forEach(row => {
      const kategori = row[11];
      if (!kategori) return;
      kategoriCounts[kategori] = (kategoriCounts[kategori] || 0) + 1;
    });

    Object.keys(kategoriCounts).forEach(kat => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${kat}</h3>
        <p class="number">${kategoriCounts[kat]}</p>
      `;
      card.onclick = () => window.location.href = `detail.html?kategori=${encodeURIComponent(kat)}`;
      cardGrid.appendChild(card);
    });
  }

  if (type === "stockMaterial") {
    values.slice(1).forEach(row => {
      const nama = row[0];
      const kode = row[1];
      const stok = row[2];
      const belum = row[3];
      if (!nama) return;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${nama}</h3>
        <p>${kode}</p>
        <p><span class="green">${stok}</span> | <span class="red">${belum}</span></p>
      `;
      card.onclick = () => window.location.href = `detail.html?material=${encodeURIComponent(nama)}&kode=${encodeURIComponent(kode)}`;
      cardGrid.appendChild(card);
    });
  }

  if (type === "materialKurang") {
    values.slice(1).forEach(row => {
      const nama = row[0];
      const kode = row[1];
      const jumlah = parseFloat(row[2] || 0);
      if (jumlah > 0) {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>${nama}</h3>
          <p>${kode}</p>
          <p class="red big">${jumlah}</p>
        `;
        cardGrid.appendChild(card);
      }
    });
  }

  container.appendChild(cardGrid);
}
