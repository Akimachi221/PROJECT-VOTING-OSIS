document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_PASSWORD = "osis2025";

    // Reset status user saat refresh
    localStorage.removeItem('voted');

    const candidates = [
        { id: 1, name: "Carren Isabella", image: "img/carren-2.jpg" },
        { id: 2, name: "Ivanna Aurelia", image: "img/ivanna.jpg" },
        { id: 3, name: "Semmy Wijaya", image: "img/semmy.jpg" },
    ];

    // Elemen DOM
    const candidatesContainer = document.getElementById('candidates-container');
    const viewResultsBtn = document.getElementById('view-results-btn');
    const adminPasswordInput = document.getElementById('admin-password-input');
    const viewResultsForm = document.getElementById('view-results-form');
    const resultsDisplay = document.getElementById('results-display');
    const resultsList = document.getElementById('results-list');
    const messageModal = document.getElementById('message-modal');
    const modalText = document.getElementById('modal-text');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const resetButton = document.getElementById('reset-btn');
    const downloadButton = document.getElementById('download-btn');

    // Modal
    function showMessage(message) {
        modalText.textContent = message;
        messageModal.classList.remove('hidden');
    }
    function hideMessage() {
        messageModal.classList.add('hidden');
    }

    // Voting Data
    function getVoteCounts() {
        const storedVotes = localStorage.getItem('osis_votes');
        if (storedVotes) {
            return JSON.parse(storedVotes);
        } else {
            const initialVotes = {};
            candidates.forEach(c => initialVotes[c.id] = 0);
            return initialVotes;
        }
    }

    let voteCounts = getVoteCounts();

    function saveVoteCounts() {
        localStorage.setItem('osis_votes', JSON.stringify(voteCounts));
    }

    // Disable tombol setelah vote
    function disableVoteButtons() {
        document.querySelectorAll('.vote-btn').forEach(button => {
            button.disabled = true;
            button.classList.add('opacity-50', 'cursor-not-allowed');
            button.classList.remove('hover:bg-blue-700');
        });
    }

    // Render kandidat
    function renderCandidates() {
        candidatesContainer.innerHTML = candidates.map(candidate => `
        <div class="candidate-card bg-terang rounded-2xl p-4 shadow-xl flex flex-col items-center transform transition-transform hover:scale-105 duration-300 border border-utama">
            <img src="${candidate.image}" alt="Foto ${candidate.name}" class="w-32 h-32 rounded-full mb-4 object-cover border-4 border-utama shadow-md">
            <h3 class="text-xl md:text-2xl font-semibold mb-2 text-teks text-center">${candidate.name}</h3>
            <button data-id="${candidate.id}" class="vote-btn w-full bg-utama text-teks font-bold py-3 px-6 rounded-full mt-auto hover:opacity-80 transition duration-300">
                Pilih
            </button>
        </div>
    `).join('');
    }

    // Render hasil
    function renderResults() {
        resultsList.innerHTML = candidates.map(candidate => `
        <div class="flex items-center justify-between p-4 bg-terang rounded-lg border border-utama">
            <span class="font-semibold text-lg text-teks">${candidate.name}</span>
            <span class="text-xl text-teks font-bold">${voteCounts[candidate.id]} suara</span>
        </div>
    `).join('');
    }


    // Download CSV
    function downloadCSV() {
        let csv = "Nama Kandidat,Suara\n";
        candidates.forEach(c => {
            csv += `${c.name},${voteCounts[c.id]}\n`;
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "hasil_voting.csv";
        link.click();
    }

    // Events
    candidatesContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('vote-btn')) {
            const candidateId = target.dataset.id;
            voteCounts[candidateId]++;
            saveVoteCounts();
            localStorage.setItem('voted', 'true');
            disableVoteButtons();
            showMessage('Terima kasih, suaramu sudah terhitung!');
        }
    });

    viewResultsBtn.addEventListener('click', () => {
        const enteredPassword = adminPasswordInput.value;
        if (enteredPassword === ADMIN_PASSWORD) {
            viewResultsForm.classList.add('hidden');
            resultsDisplay.classList.remove('hidden');
            renderResults();
        } else {
            showMessage('Kata sandi salah. Kamu tidak memiliki akses.');
        }
    });

    resetButton.addEventListener('click', () => {
        localStorage.removeItem('voted');
        localStorage.removeItem('osis_votes');
        voteCounts = getVoteCounts();
        renderResults();
        showMessage('Data voting telah direset!');
    });

    downloadButton.addEventListener('click', () => {
        downloadCSV();
    });

    modalCloseBtn.addEventListener('click', hideMessage);

    // Init
    renderCandidates();
});
