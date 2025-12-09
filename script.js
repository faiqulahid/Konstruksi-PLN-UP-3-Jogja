// script.js (FINAL)
// Pastikan config.js ter-load sebelum file ini (CONFIG.SHEET_ID, CONFIG.API_KEY)

async function loadDashboard(type) {
  if (type === "daftarTunggu") await loadDaftarTunggu();
  else if (type === "stockMaterial") await loadStockMaterial();
  else if (type === "materialKurang") await loadMaterialKurang();
}

// ===================== DAFTAR TUNGGU =====================
async function loadDaftarTunggu() {
  const range = "DAFTAR TUNGGU!A1:L3145";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const values = data.values || [];
  const rows = values.slice(1);

  // ULP berada di kolom C → index 2
  const kategoriCol = 2;
  const kategoriCount = {};

  rows.forEach(r => {
    const ulp = r[kategoriCol] || "ULP Tidak Terisi";
    kategoriCount[ulp] = (kategoriCount[ulp] || 0) + 1;
  });

  const container = document.getElementById("chartContainer");
  container.innerHTML = "";

  Object.entries(kategoriCount).forEach(([ulp, jumlah]) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${ulp}</h3>
      <p style="font-size:2em; font-weight:bold; color:#007AC3; margin:6px 0;">${jumlah}</p>
    `;
    card.onclick = () => {
      window.location.href = `detail.html?ulp=${encodeURIComponent(ulp)}`;
    };
    container.appendChild(card);
  });
}


// ===================== STOCK MATERIAL (FIXED) =====================
async function loadStockMaterial() {
  const range = "STOCK MATERIAL!A2:F";   // ambil sampai kolom F
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const values = data.values || [];

  const container = document.getElementById("chartContainer");
  container.innerHTML = "";
  const kosongList = [];

  values.forEach(row => {
    const nama = row[0];    // A
    const kode = row[3];    // D
    const stok = row[4];    // E
    const belum = row[5];   // F

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
        <p style="color:green; font-size:1.1em; font-weight:bold; margin:6px 0;">Stok: ${hasStok ? stokVal : 0}</p>
        <p style="color:red; font-size:1.1em; font-weight:bold; margin:6px 0;">Belum Datang: ${hasBelum ? belumVal : 0}</p>
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

function autoShowDashboardOneByOne() {
  const menuTypes = ['daftarTunggu', 'stockMaterial', 'materialKurang'];
  const buttons = document.querySelectorAll(".nav-btn");

  let menuIndex = 0;
  let cardIndex = 0;

  let autoShowActive = true;          // autoshow ON saat load
  let idleTimer = null;               // timer restart autoshow
  let idleTimeout = 180000;           // 3 menit (ubah jika perlu)

  // ---------------------------
  //  IDLE RESTART FUNCTION
  // ---------------------------
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      autoShowActive = true;          // autoshow hidup lagi
      menuIndex = 0;                  // mulai dari awal
      showMenu(menuTypes[menuIndex]);
    }, idleTimeout);
  }

  // ---------------------------
  //  STOP AUTOSHOW SAAT USER INTERAKSI
  // ---------------------------
  ["click", "mousemove", "keydown", "scroll"].forEach(evt => {
    window.addEventListener(evt, () => {
      if (!autoShowActive) {
        resetIdleTimer();             // restart hitung idle
      }
    });
  });

  // ---------------------------
  //  KLIK MENU = AUTOSHOW BERHENTI TOTAL
  // ---------------------------
  buttons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      autoShowActive = false;          // stop autoshow
      resetIdleTimer();                // mulai hitung idle
      menuIndex = index;

      buttons.forEach(b => b.classList.remove("highlight"));
      btn.classList.add("highlight");
    });
  });

  // ---------------------------
  //  FUNGSI TAMPILKAN MENU
  // ---------------------------
  function showMenu(menuType) {

    if (!autoShowActive) return;   // kalau autoshow mati, jangan tampilkan

    buttons.forEach(btn => btn.classList.remove("highlight"));
    buttons[menuIndex].classList.add("highlight");

    loadDashboard(menuType).then(() => {

      const container = document.getElementById("chartContainer");
      const cards = Array.from(container.querySelectorAll(".card"));

      // Hilangkan card “material kosong” dari autoshow
      const filteredCards = cards.filter(c => {
        const title = c.querySelector("h3")?.innerText.toLowerCase() || "";
        return !title.includes("material kosong");
      });

      cardIndex = 0;
      filteredCards.forEach(c => {
        c.style.display = "none";
        c.classList.remove("autoshow-zoom");
      });

      if (filteredCards.length === 0) {
        setTimeout(nextMenu, 2000);
        return;
      }

      // ---------------------------
      //  SHOW CARD AUTOMATIS
      // ---------------------------
      function showCard() {

        if (!autoShowActive) return;   // jika autoshow dimatikan user

        filteredCards.forEach(c => {
          c.style.display = "none";
          c.classList.remove("autoshow-zoom");
        });

        const card = filteredCards[cardIndex];
        card.style.display = "block";
        card.style.opacity = "0";

        card.classList.add("autoshow-zoom");

        requestAnimationFrame(() => {
          card.style.opacity = "1";
        });

        setTimeout(() => {

          if (!autoShowActive) return;   // cek lagi

          card.classList.remove("autoshow-zoom");
          card.style.opacity = "0";

          cardIndex++;

          if (cardIndex < filteredCards.length) {
            showCard();
          } else {
            nextMenu();
          }

        }, 3600);

      }

      showCard();
    });
  }

  // ---------------------------
  //  PINDAH MENU
  // ---------------------------
  function nextMenu() {
    if (!autoShowActive) return;  // autoshow berhenti total
    menuIndex = (menuIndex + 1) % menuTypes.length;
    showMenu(menuTypes[menuIndex]);
  }

  // ---------------------------
  //  JALANKAN AUTOSHOW PERTAMA KALI
  // ---------------------------
  showMenu(menuTypes[menuIndex]);
}

window.addEventListener("load", autoShowDashboardOneByOne);

