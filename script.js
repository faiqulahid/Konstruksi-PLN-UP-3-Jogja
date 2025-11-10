// main.js
const { "AIzaSyDlV3SCfV4DNIRApbut9341pUdxwrkjjzQ", "1Ch1QiJIZaX1Nr4zHdbuNYPlzeLPdHJabHTJ_ZFXs82w" }; } = CONFIG;

// Contoh fungsi load dashboard
async function loadDashboard() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/'STOCK MATERIAL'!A1:Z1000?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  const rows = data.values.slice(1);

  const container = document.getElementById("dashboard-container");
  container.innerHTML = "";

  rows.forEach(row => {
    const nama = row[0];
    const stok = parseInt(row[1] || 0);
    const pesan = parseInt(row[2] || 0);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${nama}</h3>
      <p style="color:green;">Stok: ${stok}</p>
      <p style="color:red;">Dipesan: ${pesan}</p>
    `;

    // Klik card untuk buka detail
    card.addEventListener("click", () => {
      window.location.href = `detail.html?type=stockMaterial&kode=${row[5]}`;
    });

    container.appendChild(card);
  });
}

window.onload = loadDashboard;
