/* ======================================================
   Dashboard Antrian Puskesmas Piyungan
   Version : 2.2
====================================================== */

const API_URL =
"https://script.google.com/macros/s/AKfycbzDSCls-ES8YilCo22T9MS1WsiELYP6mrz96HmN6mmIfh_JBsWJMOtzLcWec3TutLdPWQ/exec";

let oldData = {};

/* ======================================================
   Warna Otomatis Setiap Poli
====================================================== */

function getCardClass(poli) {

    poli = poli.toUpperCase();

    if (poli.includes("PENDAFTARAN")) return "pendaftaran";

    if (poli.includes("KIA")) return "kia";

    if (poli.includes("UMUM")) return "umum";

    if (poli.includes("GIGI")) return "gigi";

    if (poli.includes("UGD")) return "ugd";

    if (poli.includes("FISIOTERAPI")) return "fisioterapi";

    if (poli.includes("PSIKOLOGI")) return "psikologi";

    if (poli.includes("INFEKSI")) return "infeksi";

    return "";
}

/* ======================================================
   Render Card
====================================================== */

function renderCards(data) {

    const container = document.getElementById("cards");

    container.innerHTML = "";

    Object.entries(data).forEach(([poli, nomor]) => {

        if (poli === "lastUpdate") return;

        const changed =
            oldData[poli] &&
            oldData[poli] !== nomor;

        const cardClass = getCardClass(poli);

        container.innerHTML += `
            <div class="card ${cardClass} ${changed ? "card-update" : ""}">

                <div class="card-header">
                    ${poli}
                </div>

                <div class="card-body">

                    <div class="queue-number">
                        ${nomor}
                    </div>

                </div>

                <div class="card-footer">
                    Update ${data.lastUpdate}
                </div>

            </div>
        `;

    });

    oldData = { ...data };

}

/* ======================================================
   Ambil Data dari Apps Script
====================================================== */

async function loadQueue() {

    try {

        const response = await fetch(API_URL, {
            method: "GET",
            cache: "no-store",
            redirect: "follow"
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const data = await response.json();

        renderCards(data);

        document.getElementById("lastUpdate").textContent =
            data.lastUpdate + " WIB";

        document.getElementById("connection").textContent =
            "🟢 ONLINE";

        document.getElementById("connection").className =
            "connection online";

    } catch (err) {

        console.error(err);

        document.getElementById("connection").textContent =
            "🔴 OFFLINE";

        document.getElementById("connection").className =
            "connection offline";
    }
}

/* ======================================================
   Jam Digital
====================================================== */

function updateClock() {

    const now = new Date();

    const time = now.toLocaleTimeString("id-ID", {
        hour12: false
    });

    document.getElementById("clock").textContent =
        time + " WIB";

}

/* ======================================================
   Start
====================================================== */

updateClock();
setInterval(updateClock, 1000);

loadQueue();
setInterval(loadQueue, 30000);