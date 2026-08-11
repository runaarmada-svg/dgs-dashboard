/* ======================================================
   Dashboard Antrian Puskesmas Piyungan
   Version : 3.0
   Schedule : Senin-Sabtu
====================================================== */

const API_URL =
"https://script.google.com/macros/s/AKfycbzDSCls-ES8YilCo22T9MS1WsiELYP6mrz96HmN6mmIfh_JBsWJMOtzLcWec3TutLdPWQ/exec";

const REFRESH_INTERVAL = 30000;

let oldData = {};
let lastValidData = null;
/* ======================================================
   WARNA SETIAP POLI
====================================================== */

function getCardClass(poli) {

    const name = poli
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    if (name.includes("pendaftaran")) {
        return "pendaftaran";
    }

    if (name.includes("kia")) {
        return "kia";
    }

    if (name.includes("umum")) {
        return "umum";
    }

    if (name.includes("gigi")) {
        return "gigi";
    }

    if (name.includes("ugd")) {
        return "ugd";
    }

    if (name.includes("fisioterapi")) {
        return "fisioterapi";
    }

    if (name.includes("psikologi")) {
        return "psikologi";
    }

    if (name.includes("infeksi")) {
        return "infeksi";
    }

    if (name.includes("lansia")) {
        return "lansia";
    }

    return "";
}


/* ======================================================
   JADWAL ANTRIAN
====================================================== */

function getSchedule() {

    const now = new Date();

    // Paksa menggunakan WIB
    const wibString = now.toLocaleString("en-US", {
        timeZone: "Asia/Jakarta"
    });

    const wib = new Date(wibString);

    const day = wib.getDay();
    const hour = wib.getHours();
    const minute = wib.getMinutes();

    const currentMinutes = hour * 60 + minute;

    /*
        Minggu
        0 = Sunday
    */

    if (day === 0) {

        return {
            status: "closed",
            title: "ANTRIAN ONLINE DITUTUP",
            message: "Hari Minggu layanan antrean online libur.",
            open: null,
            close: null
        };

    }

    /*
        Senin - Kamis
        07:00 - 11:00
    */

    if (day >= 1 && day <= 4) {

        return createSchedule(
            currentMinutes,
            7 * 60,
            11 * 60
        );

    }

    /*
        Jumat - Sabtu
        07:00 - 10:00
    */

    if (day === 5 || day === 6) {

        return createSchedule(
            currentMinutes,
            7 * 60,
            10 * 60
        );

    }

}


/* ======================================================
   MEMBUAT STATUS JADWAL
====================================================== */

function createSchedule(currentMinutes, openMinutes, closeMinutes) {

    const openTime = formatMinutes(openMinutes);
    const closeTime = formatMinutes(closeMinutes);

    // Belum buka
    if (currentMinutes < openMinutes) {

        return {

            status: "before",

            title: "ANTRIAN ONLINE BELUM DIBUKA",

            message:
                `Pendaftaran antrean online dibuka pukul ${openTime} WIB.`,

            open: openTime,
            close: closeTime

        };

    }

    // Sudah tutup
    if (currentMinutes >= closeMinutes) {

        return {

            status: "after",

            title: "ANTRIAN ONLINE DITUTUP",

            message:
                `Antrean online hari ini telah ditutup pada pukul ${closeTime} WIB.`,

            open: openTime,
            close: closeTime

        };

    }

    // Sedang buka
    return {

        status: "open",

        title: "ANTRIAN ONLINE AKTIF",

        message:
            `Antrean online dibuka sampai pukul ${closeTime} WIB.`,

        open: openTime,
        close: closeTime

    };

}


/* ======================================================
   FORMAT JAM
====================================================== */

function formatMinutes(minutes) {

    const hour =
        Math.floor(minutes / 60)
        .toString()
        .padStart(2, "0");

    const minute =
        (minutes % 60)
        .toString()
        .padStart(2, "0");

    return `${hour}:${minute}`;

}


/* ======================================================
   JAM WIB
====================================================== */

function getWIBTime() {

    return new Date().toLocaleTimeString(
        "id-ID",
        {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }
    );

}


/* ======================================================
   STATUS BANNER
====================================================== */

function createStatusBanner() {

    let banner =
        document.getElementById("queueSchedule");

    if (!banner) {

        banner = document.createElement("div");

        banner.id = "queueSchedule";

        const cards =
            document.getElementById("cards");

        if (cards) {

            cards.parentNode.insertBefore(
                banner,
                cards
            );

        } else {

            document.body.prepend(banner);

        }

    }

    return banner;

}


/* ======================================================
   TAMPILKAN STATUS JADWAL
====================================================== */

function renderSchedule() {

    const schedule =
        getSchedule();

    const banner =
        createStatusBanner();

    banner.className =
        "queue-schedule " + schedule.status;

    let icon = "🟢";

    if (schedule.status === "before") {
        icon = "🕖";
    }

    if (schedule.status === "after") {
        icon = "🔴";
    }

    if (schedule.status === "closed") {
        icon = "🔴";
    }

    banner.innerHTML = `

        <div class="schedule-icon">
            ${icon}
        </div>

        <div class="schedule-content">

            <div class="schedule-title">
                ${schedule.title}
            </div>

            <div class="schedule-message">
                ${schedule.message}
            </div>

            ${
                schedule.open
                ?
                `
                <div class="schedule-hours">
                    Jam layanan online:
                    <strong>
                        ${schedule.open} - ${schedule.close} WIB
                    </strong>
                </div>
                `
                :
                `
                <div class="schedule-hours">
                    <strong>
                        Layanan antrean online tutup setiap Minggu
                    </strong>
                </div>
                `
            }

        </div>

    `;

}


/* ======================================================
   CEK APAKAH SEDANG BUKA
====================================================== */

function isQueueOpen() {

    return getSchedule().status === "open";

}


/* ======================================================
   RENDER KARTU POLI
====================================================== */

function renderCards(data) {

    const container =
        document.getElementById("cards");

    if (!container) return;

    /*
        Kalau layanan tutup,
        jangan tampilkan nomor antrean.
    */

    if (!isQueueOpen()) {

        container.innerHTML = "";

        return;

    }

    container.innerHTML = "";

    Object.entries(data).forEach(
        ([poli, nomor]) => {

            if (poli === "lastUpdate") return;

            const changed =
                oldData[poli] &&
                oldData[poli] !== nomor;

            container.innerHTML += `

                <div class="card ${getCardClass(poli)} ${changed ? "card-update" : ""}">

                    <div class="card-header">
                        ${poli}
                    </div>

                    <div class="card-body">

                        <div class="queue-number">
                            ${nomor}
                        </div>

                    </div>

                    <div class="card-footer">

                        Update ${data.lastUpdate || "--"}

                    </div>

                </div>

            `;

        }
    );

    oldData = {
        ...data
    };

}


/* ======================================================
   LOAD DATA DARI GOOGLE APPS SCRIPT
====================================================== */

async function loadQueue() {

    /*
        Saat tutup, tidak perlu mengambil data
        terus-menerus.
    */

    if (!isQueueOpen()) {

        renderSchedule();

        renderCards({});

        document.getElementById("connection").textContent =
            "🔴 LAYANAN TUTUP";

        document.getElementById("connection").className =
            "connection offline";

        return;

    }


    try {

        const response =
            await fetch(
                API_URL + "?t=" + Date.now(),
                {
                    method: "GET",
                    cache: "no-store",
                    redirect: "follow"
                }
            );

        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }

        const data =
            await response.json();


        /*
            Proteksi tambahan:
            jangan menganggap response kosong
            sebagai data valid.
        */

        const poliCount =
            Object.keys(data)
                .filter(
                    key => key !== "lastUpdate"
                )
                .length;


        if (poliCount === 0) {

            console.warn(
                "API mengembalikan data poli kosong."
            );

            /*
                Jika sebelumnya memiliki data valid,
                pertahankan tampilan terakhir.
            */

            if (lastValidData) {

                renderCards(
                    lastValidData
                );

            }

            document.getElementById("connection").textContent =
                "🟡 MENUNGGU DATA";

            document.getElementById("connection").className =
                "connection waiting";

            return;

        }


        /*
            Data valid
        */

        lastValidData = {
            ...data
        };

        renderCards(data);


        if (data.lastUpdate) {

            document.getElementById(
                "lastUpdate"
            ).textContent =
                data.lastUpdate + " WIB";

        }


        document.getElementById("connection").textContent =
            "🟢 ONLINE";

        document.getElementById("connection").className =
            "connection online";


    }

    catch (err) {

        console.error(
            "Gagal mengambil data:",
            err
        );


        /*
            Jangan langsung menghilangkan
            data terakhir.
        */

        if (lastValidData) {

            renderCards(
                lastValidData
            );

        }


        document.getElementById("connection").textContent =
            "🟡 MENUNGGU KONEKSI";

        document.getElementById("connection").className =
            "connection waiting";

    }

}


/* ======================================================
   JAM UTAMA
====================================================== */

function updateClock() {

    const clock =
        document.getElementById("clock");

    if (!clock) return;

    clock.textContent =
        getWIBTime() + " WIB";

}


/* ======================================================
   REFRESH STATUS
====================================================== */

function refreshDashboard() {

    renderSchedule();

    loadQueue();

}


/* ======================================================
   START
====================================================== */

updateClock();

renderSchedule();

refreshDashboard();


/*
    Jam diperbarui setiap detik.
*/

setInterval(
    updateClock,
    1000
);


/*
    Status buka/tutup dicek setiap detik.
    Jadi tepat pukul 07:00 atau 11:00
    dashboard langsung berubah.
*/

setInterval(
    renderSchedule,
    1000
);


/*
    Data antrean diperbarui setiap 30 detik.
*/

setInterval(
    loadQueue,
    REFRESH_INTERVAL
);
