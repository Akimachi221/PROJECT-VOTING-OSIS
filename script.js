// Import Firebase Firestore dari CDN
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const db = window.db; // dari index.html
const ADMIN_PASSWORD = "osis2025";

// Kandidat
const candidates = [
    { id: "carren", name: "Carren Isabella", image: "img/carren-2.jpg" },
    { id: "ivanna", name: "Ivanna Aurelia", image: "img/ivanna.jpg" },
    { id: "semmy", name: "Semmy Wijaya", image: "img/semmy.jpg" },
];

// Elemen DOM
const candidatesContainer = document.getElementById("candidates-container");
const viewResultsBtn = document.getElementById("view-results-btn");
const adminPasswordInput = document.getElementById("admin-password-input");
const viewResultsForm = document.getElementById("view-results-form");
const resultsDisplay = document.getElementById("results-display");
const resultsList = document.getElementById("results-list");
const messageModal = document.getElementById("message-modal");
const modalText = document.getElementById("modal-text");
const modalCloseBtn = document.getElementById("modal-close-btn");
const resetButton = document.getElementById("reset-btn");
const downloadButton = document.getElementById("download-btn");

// Modal
function showMessage(message) {
    modalText.textContent = message;
    messageModal.classList.remove("hidden");
}
function hideMessage() {
    messageModal.classList.add("hidden");
}

// Disable tombol setelah vote
function disableVoteButtons() {
    document.querySelectorAll(".vote-btn").forEach((button) => {
        button.disabled = true;
        button.classList.add("opacity-50", "cursor-not-allowed");
        button.classList.remove("hover:opacity-80");
    });
}

// ✅ Render kandidat (pakai style lama, biar gambar aman)
function renderCandidates() {
    candidatesContainer.innerHTML = candidates.map(candidate => `
        <div class="candidate-card bg-terang rounded-2xl p-4 shadow-xl flex flex-col items-center transform transition-transform hover:scale-105 duration-300 border border-utama">
            <img src="${candidate.image}" alt="Foto ${candidate.name}" 
                 class="w-32 h-32 rounded-full mb-4 object-cover border-4 border-utama shadow-md"
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/150/FF0000/FFFFFF?text=IMG+ERROR';">
            <h3 class="text-xl md:text-2xl font-semibold mb-2 text-teks text-center">${candidate.name}</h3>
            <button data-id="${candidate.id}" class="vote-btn w-full bg-utama text-teks font-bold py-3 px-6 rounded-full mt-auto hover:opacity-80 transition duration-300">
                Pilih
            </button>
        </div>
    `).join('');

    if (localStorage.getItem("voted")) {
        disableVoteButtons();
    }
}

// Voting
async function vote(candidateId) {
    try {
        const ref = doc(db, "votes", candidateId);
        await updateDoc(ref, { count: increment(1) });
        localStorage.setItem("voted", "true");
        disableVoteButtons();
        showMessage("Terima kasih, suaramu sudah terhitung!");
    } catch (error) {
        console.error("Error saat voting:", error);
        showMessage("Terjadi kesalahan, coba lagi.");
    }
}

// Render hasil admin
function renderResults() {
    resultsList.innerHTML = candidates.map(c => `
        <div class="flex items-center justify-between p-4 bg-terang rounded-lg border border-utama">
            <span class="font-semibold text-lg text-teks">${c.name}</span>
            <span id="results-${c.id}" class="text-xl text-teks font-bold">0 suara</span>
        </div>
    `).join('');

    listenResults();
}

// Realtime listener hasil
function listenResults() {
    candidates.forEach((c) => {
        const ref = doc(db, "votes", c.id);
        onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                const el = document.getElementById(`results-${c.id}`);
                if (el) {
                    el.textContent = `${data.count} suara`;
                }
            }
        });
    });
}

// Reset voting (admin)
async function resetVoting() {
    try {
        for (let c of candidates) {
            const ref = doc(db, "votes", c.id);
            await setDoc(ref, { count: 0 });
        }
        showMessage("Data voting telah direset!");
    } catch (error) {
        console.error("Error reset voting:", error);
        showMessage("Gagal reset voting.");
    }
}

// Download CSV
async function downloadCSV() {
    let csv = "Nama Kandidat,Suara\n";
    for (let c of candidates) {
        const ref = doc(db, "votes", c.id);
        const snap = await getDoc(ref);
        const count = snap.exists() ? snap.data().count : 0;
        csv += `${c.name},${count}\n`;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "hasil_voting.csv";
    link.click();
}

// Events
candidatesContainer.addEventListener("click", (event) => {
    const target = event.target;
    if (target.classList.contains("vote-btn")) {
        const candidateId = target.dataset.id;
        vote(candidateId);
    }
});

viewResultsBtn.addEventListener("click", () => {
    const enteredPassword = adminPasswordInput.value;
    if (enteredPassword === ADMIN_PASSWORD) {
        viewResultsForm.classList.add("hidden");
        resultsDisplay.classList.remove("hidden");
        renderResults();
    } else {
        showMessage("Kata sandi salah. Kamu tidak memiliki akses.");
    }
});

resetButton.addEventListener("click", resetVoting);
downloadButton.addEventListener("click", downloadCSV);
modalCloseBtn.addEventListener("click", hideMessage);

// Init
renderCandidates();
