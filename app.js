// Logicall Arcade Portal App Controller

const SUPABASE_URL = 'https://xoopahkzmfibfnxzmqfk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pSbbyCzo8R0oPeyK_xwGtg_C81049id';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let myUsername = 'Pemain 1';
const myClientId = Math.random().toString(36).substring(2, 10);
let lobbyChannel = null;

// ─── SweetAlert2 dark theme defaults ───────────────────────────────────────
const swalDark = {
    background: '#0f1623',
    color: '#e5e7eb',
    confirmButtonColor: '#8b5cf6',
    cancelButtonColor: '#374151',
};

document.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('logicall_username');
    if (savedName) {
        myUsername = savedName;
    } else {
        myUsername = 'User_' + Math.floor(100 + Math.random() * 900);
        localStorage.setItem('logicall_username', myUsername);
    }
    const nameInput = document.getElementById('global-username-input');
    if (nameInput) nameInput.value = myUsername;
    setupLobby();
});

function changeUsername(value) {
    if (value.trim()) {
        myUsername = value.trim();
        localStorage.setItem('logicall_username', myUsername);
        if (lobbyChannel) {
            lobbyChannel.track({
                status: 'lobby',
                username: myUsername,
                clientId: myClientId,
                onlineAt: new Date().toISOString()
            });
        }
    }
}

function triggerHardReload() {
    Swal.fire({
        ...swalDark,
        title: 'Reset Semua Data?',
        html: 'Ini akan menghapus semua <b>rekor</b> dan <b>nama pengguna</b>. Lanjutkan?',
        icon: 'warning',
        iconColor: '#f59e0b',
        showCancelButton: true,
        confirmButtonText: '<i class="fa-solid fa-trash"></i>&nbsp;Ya, Reset',
        cancelButtonText: 'Batal',
        reverseButtons: true,
    }).then(result => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.reload();
        }
    });
}

function setupLobby() {
    if (typeof supabase === 'undefined' || !supabaseClient) {
        console.error('Supabase client is not loaded.');
        return;
    }

    lobbyChannel = supabaseClient.channel('arcade-lobby', {
        config: { presence: { key: myClientId } },
    });

    // Re-render on any presence change (sync covers all edge cases,
    // join/leave give faster visual feedback)
    const onPresenceChange = () => renderLobby(lobbyChannel.presenceState());

    lobbyChannel
        .on('presence', { event: 'sync' },  onPresenceChange)
        .on('presence', { event: 'join' },  onPresenceChange)
        .on('presence', { event: 'leave' }, onPresenceChange)
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                lobbyChannel.track({
                    status: 'lobby',
                    username: myUsername,
                    clientId: myClientId,
                    onlineAt: new Date().toISOString()
                });
            }
        });
}


function renderLobby(presenceState) {
    const allPresences = [];
    Object.keys(presenceState).forEach(key => {
        presenceState[key].forEach(p => allPresences.push(p));
    });

    const countEl = document.getElementById('lobby-online-count');
    if (countEl) countEl.textContent = allPresences.length;

    const activeRooms = [];
    const seenRooms = new Set();
    allPresences.forEach(p => {
        if (p.roomCode && p.game && !seenRooms.has(p.roomCode)) {
            seenRooms.add(p.roomCode);
            activeRooms.push(p);
        }
    });

    const container = document.getElementById('lobby-rooms-container');
    if (!container) return;

    if (activeRooms.length === 0) {
        container.innerHTML = `
            <div class="flex-1 flex flex-col items-center justify-center py-8 text-center px-2">
                <i class="fa-solid fa-gamepad text-gray-700 text-2xl mb-2 block"></i>
                <p class="text-gray-500 text-[10px] leading-relaxed">Belum ada room dibagikan.<br>Buat room &amp; klik "Bagikan ke Lobby"!</p>
            </div>`;
    } else {
        container.innerHTML = activeRooms.map(room => {
            const isWordle = room.game.toLowerCase() === 'wordle';
            const gameLabel = isWordle ? 'Wordle' : 'Sudoku';
            const gameIcon = isWordle ? 'fa-font' : 'fa-grid-3x3';
            const iconBg = isWordle ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-brandPurple/30 bg-brandPurple/10';
            const iconColor = isWordle ? 'text-emerald-400' : 'text-brandPurple';
            const badgeClass = isWordle
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-brandPurple/10 border-brandPurple/30 text-brandPurple';

            const maxPlayers = room.maxPlayers || (isWordle ? 2 : 5);
            const currentCount = room.playerCount || 1;
            const isFull = currentCount >= maxPlayers;

            const joinUrl = isWordle
                ? `./wordle/?room=${encodeURIComponent(room.roomCode)}`
                : `./sudoku/?room=${encodeURIComponent(room.roomCode)}`;

            const btnClass = isFull
                ? 'px-3 py-1.5 rounded-lg bg-gray-800 text-gray-500 border border-gray-700/30 cursor-not-allowed text-[10px] font-bold flex-shrink-0'
                : 'px-3 py-1.5 rounded-lg bg-gradient-to-r from-brandPurple to-brandIndigo text-white text-[10px] font-bold flex-shrink-0 transition-all hover:opacity-90 active:scale-95';
            const btnAction = isFull ? '' : `onclick="window.location.href='${joinUrl}'"`;

            return `
                <div class="lobby-room-card">
                    <!-- Header: game badge + player count -->
                    <div class="flex items-center justify-between mb-2">
                        <span class="lobby-badge ${isWordle ? 'lobby-badge--wordle' : 'lobby-badge--sudoku'}">
                            <i class="fa-solid ${gameIcon}"></i> ${gameLabel}
                        </span>
                        <span class="lobby-players ${isFull ? 'lobby-players--full' : 'lobby-players--open'}">
                            <span class="lobby-dot ${isFull ? 'lobby-dot--full' : 'lobby-dot--open'}"></span>
                            ${currentCount}/${maxPlayers}
                        </span>
                    </div>
                    <!-- Host name -->
                    <p class="lobby-hostname">${escapeHTML(room.hostName || 'Host')}</p>
                    <!-- Room code -->
                    <p class="lobby-code">${escapeHTML(room.roomCode)}</p>
                    <!-- Join button -->
                    <button ${btnAction} ${isFull ? 'disabled' : ''}
                        class="lobby-join-btn ${isFull ? 'lobby-join-btn--full' : 'lobby-join-btn--open'}">
                        ${isFull
                            ? '<i class="fa-solid fa-lock"></i> Penuh'
                            : '<i class="fa-solid fa-right-to-bracket"></i> Gabung'
                        }
                    </button>
                </div>`;

        }).join('');
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// ─── SweetAlert2 Modal Controllers ─────────────────────────────────────────

function toggleAboutModal() {
    Swal.fire({
        ...swalDark,
        title: '<i class="fa-solid fa-circle-info" style="color:#8b5cf6;margin-right:6px"></i>Tentang Logicall',
        html: `
            <div style="text-align:left;font-size:0.78rem;color:#9ca3af;line-height:1.7">
                <p style="margin-bottom:12px"><strong style="color:#fff">Logicall</strong> adalah portal game asah otak minimalis modern, terinspirasi dari konsep Friv Grid klasik.</p>
                <p style="font-size:0.68rem;font-weight:700;letter-spacing:.08em;color:#8b5cf6;text-transform:uppercase;margin-bottom:6px">🎮 Game Tersedia</p>
                <ul style="list-style:disc;padding-left:1.2em;margin-bottom:12px">
                    <li style="margin-bottom:5px"><strong style="color:#fff">Sudoku Pro</strong> — Tingkat kesulitan, Notes, Hint, Multiplayer co-op</li>
                    <li><strong style="color:#fff">Wordle Indonesia</strong> — Tebak kata 5 huruf, statistik, keyboard virtual</li>
                </ul>
                <p style="font-size:0.68rem;font-weight:700;letter-spacing:.08em;color:#8b5cf6;text-transform:uppercase;margin-bottom:6px">✨ Fitur Portal</p>
                <ul style="list-style:disc;padding-left:1.2em">
                    <li style="margin-bottom:5px"><strong style="color:#fff">Auto-Save</strong> — Waktu terbaik disimpan di localStorage</li>
                    <li style="margin-bottom:5px"><strong style="color:#fff">Responsive</strong> — Nyaman di HP maupun Desktop</li>
                    <li><strong style="color:#fff">Lobby Realtime</strong> — Bagikan &amp; bergabung room multiplayer</li>
                </ul>
            </div>`,
        confirmButtonText: 'Mengerti',
        width: 460,
    });
}

function showComingSoon(gameName) {
    Swal.fire({
        ...swalDark,
        title: '⏳ Segera Hadir!',
        html: `Game <strong style="color:#8b5cf6">${escapeHTML(gameName)}</strong> sedang dikembangkan oleh tim kami.<br><br><span style="color:#6b7280;font-size:0.8rem">Tunggu pembaruan berikutnya!</span>`,
        confirmButtonText: '👍 Siap, Ditunggu!',
        width: 360,
    });
}

function hideComingSoon() {
    Swal.close();
}
