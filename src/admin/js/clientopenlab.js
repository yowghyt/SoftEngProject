document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 1000);

    loadTodayLogs();      // All logs tab
    loadBYODLogs();       // Pre-load BYOD tab
    loadKnowledgeCenterLogs(); // Pre-load KC tab
    loadActiveUsers();    // if you add that tab later
    loadStatistics();
    setupFilters();
});

// ==================== CLOCK ====================
function updateClock() {
    const now = new Date();
    document.getElementById("current-date").textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    document.getElementById("current-time").textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ==================== LOAD ALL TODAY'S LOGS ====================
async function loadTodayLogs() {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/log.php?action=get_today_logs");
        const result = await response.json();

        if (result.status === "success") {
            displayTodayLogs(result.data, '#all-logs');
        } else {
            showEmptyState('all-logs', 'Failed to load logs');
        }
    } catch (error) {
        console.error("Error loading today logs:", error);
        showEmptyState('all-logs', 'Error loading data');
    }
}

// ==================== LOAD BYOD LOGS (TODAY ONLY) ====================
async function loadBYODLogs() {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/log.php?action=get_byod_logs");
        const result = await response.json();

        if (result.status === "success") {
            const today = new Date().toISOString().split("T")[0];
            const todayLogs = result.data.filter(log => log.date === today);
            displayTodayLogs(todayLogs, '#lab1-logs');
        } else {
            showEmptyState('lab1-logs', 'No BYOD logs');
        }
    } catch (error) {
        console.error(error);
        showEmptyState('lab1-logs', 'Error loading BYOD logs');
    }
}

// ==================== LOAD KNOWLEDGE CENTER LOGS (TODAY ONLY) ====================
async function loadKnowledgeCenterLogs() {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/log.php?action=get_kc_logs");
        const result = await response.json();

        if (result.status === "success") {
            const today = new Date().toISOString().split("T")[0];
            const todayLogs = result.data.filter(log => log.date === today);
            displayTodayLogs(todayLogs, '#lab2-logs');
        } else {
            showEmptyState('lab2-logs', 'No KC logs');
        }
    } catch (error) {
        console.error(error);
        showEmptyState('lab2-logs', 'Error loading KC logs');
    }
}

// ==================== DISPLAY LOGS (REUSABLE) ====================
function displayTodayLogs(logs, tabId) {
    const tbody = document.querySelector(`${tabId} tbody`);
    if (!tbody) return;

    if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No records yet</td></tr>`;
        return;
    }

    tbody.innerHTML = logs.map(log => {
        const labPrefix = log.labType && log.labType.includes("BYOD") ? "BYOD" : "KC";
        const logIdDisplay = `#${labPrefix}-${String(log.idLog).padStart(3, '0')}`;

        return `
            <tr>
                <td>${logIdDisplay}</td>
                <td><strong>${log.idNumber || log.studentId}</strong></td>
                <td>${log.studentName || `${log.firstName} ${log.lastName}`}</td>
                ${tabId === '#all-logs' ? `<td>${log.labType} - ${log.roomName}</td>` : ''}
                <td>${formatDate(log.date)}</td>
                <td>${formatTime(log.timeIn)}</td>
                ${tabId !== '#all-logs' ? `<td>${log.roomName || log.room}</td>` : ''}
                <td>${log.purpose || '-'}</td>
            </tr>`;
    }).join('');
}

// ==================== LOAD STATISTICS ====================
async function loadStatistics() {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/log.php?action=get_statistics");
        const result = await response.json();

        if (result.status === "success") {
            const s = result.data;

            // Correct mapping to your 4 cards
            document.getElementById("inside-count").textContent     = (s.byod_inside || 0) + (s.kc_inside || 0); // total active
            document.getElementById("today-count").textContent       = s.total_today || 0;
            document.getElementById("avg-duration").textContent      = s.avg_duration ? `${s.avg_duration}h` : '0h';
            document.getElementById("capacity-current").textContent = (s.byod_inside || 0) + (s.kc_inside || 0);

            // Optional: show separate BYOD / KC inside if you want
            // document.getElementById("some-id").textContent = s.byod_inside;
        }
    } catch (error) {
        console.error("Error loading statistics:", error);
    }
}

// ==================== ACTIVE USERS (if you add the tab later) ====================
async function loadActiveUsers() {
    // similar to loadTodayLogs but add filter timeOut IS NULL
    // implement when needed
}

// ==================== HELPER FUNCTIONS ====================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeString) {
    if (!timeString) return '-';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function showEmptyState(tabId, message) {
    const tbody = document.querySelector(`#${tabId.replace('#', '')} tbody`);
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">${message}</td></tr>`;
    }
}

// ==================== TAB FILTERS (refresh on click if you want) ====================
function setupFilters() {
    document.getElementById('all-logs-tab')?.addEventListener('click', loadTodayLogs);
    document.getElementById('lab1-tab')?.addEventListener('click', loadBYODLogs);
    document.getElementById('lab2-tab')?.addEventListener('click', loadKnowledgeCenterLogs);
}