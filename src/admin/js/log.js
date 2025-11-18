document.addEventListener("DOMContentLoaded", () => {
    loadAllLogs();
    loadStatistics();
    setupFilters();
});

// ==================== LOAD ALL LOGS ====================
async function loadAllLogs() {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/log.php?action=get_all_logs");
        const result = await response.json();

        if (result.status === "success") {
            displayAllLogs(result.data);
        } else {
            console.error("Error:", result.message);
            showEmptyState('all-logs', 'Failed to load logs');
        }
    } catch (error) {
        console.error("Error loading logs:", error);
        showEmptyState('all-logs', 'Failed to load logs');
    }
}

function displayAllLogs(logs) {
    const tbody = document.querySelector('#all-logs tbody');

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No lab entry logs found</td></tr>';
        return;
    }

    tbody.innerHTML = logs.map((log, index) => {

        return `
            <tr>
                <td>#LOG-${String(log.idLog).padStart(3, '0')}</td>
                <td><strong>${log.idNumber}</strong></td>
                <td>${log.studentName}</td>
                <td>${log.labType} - ${log.roomName}</td>
                <td>${formatDate(log.date)}</td>
                <td>${formatTime(log.timeIn)}</td>
            </tr>
        `;
    }).join('');
}

// ==================== LOAD BYOD LAB LOGS ====================
async function loadBYODLogs() {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/log.php?action=get_byod_logs");
        const result = await response.json();

        if (result.status === "success") {
            displayLabLogs(result.data, 'lab1-logs');
        } else {
            console.error("Error:", result.message);
            showEmptyState('lab1-logs', 'Failed to load BYOD logs');
        }
    } catch (error) {
        console.error("Error loading BYOD logs:", error);
        showEmptyState('lab1-logs', 'Failed to load BYOD logs');
    }
}

// ==================== LOAD KNOWLEDGE CENTER LOGS ====================
async function loadKnowledgeCenterLogs() {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/log.php?action=get_kc_logs");
        const result = await response.json();

        if (result.status === "success") {
            displayLabLogs(result.data, 'lab2-logs');
        } else {
            console.error("Error:", result.message);
            showEmptyState('lab2-logs', 'Failed to load Knowledge Center logs');
        }
    } catch (error) {
        console.error("Error loading Knowledge Center logs:", error);
        showEmptyState('lab2-logs', 'Failed to load Knowledge Center logs');
    }
}

function displayLabLogs(logs, tabId) {
    const tbody = document.querySelector(`#${tabId} tbody`);

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No logs found for this lab</td></tr>';
        return;
    }

    tbody.innerHTML = logs.map((log) => {
        return `
            <tr>
                <td>#LOG-${String(log.idLog).padStart(3, '0')}</td>
                <td><strong>${log.idNumber}</strong></td>
                <td>${log.studentName}</td>
                <td>${formatDate(log.date)}</td>
                <td>${formatTime(log.timeIn)}</td>
                <td>${log.roomName}</td>
                <td><span class="badge bg-primary">Entry Log</span></td>
            </tr>
        `;
    }).join('');
}

// ==================== LOAD CURRENTLY INSIDE ====================
async function loadActiveUsers() {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/log.php?action=get_active_users");
        const result = await response.json();

        if (result.status === "success") {
            displayActiveUsers(result.data);
        } else {
            console.error("Error:", result.message);
            showEmptyState('active-logs', 'Failed to load active users');
        }
    } catch (error) {
        console.error("Error loading active users:", error);
        showEmptyState('active-logs', 'Failed to load active users');
    }
}

function displayActiveUsers(logs) {
    const tbody = document.querySelector('#active-logs tbody');

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No students currently inside labs</td></tr>';
        return;
    }

    tbody.innerHTML = logs.map((log) => {

        return `
            <tr>
                <td>#LOG-${String(log.idLog).padStart(3, '0')}</td>
                <td><strong>${log.idNumber}</strong></td>
                <td>${log.studentName}</td>
                <td>${formatDate(log.date)}</td>
                <td>${formatTime(log.timeIn)}</td>
                <td>${log.labType} - ${log.roomName}</td>
                <td><span class="badge bg-primary">Entry Log</span></td>
            </tr>
        `;
    }).join('');
}

// ==================== LOAD STATISTICS ====================
async function loadStatistics() {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/log.php?action=get_statistics");
        const result = await response.json();

        if (result.status === "success") {
            updateStatistics(result.data);
        } else {
            console.error("Error loading statistics:", result.message);
        }
    } catch (error) {
        console.error("Error loading statistics:", error);
    }
}

function updateStatistics(stats) {
    const statCards = document.querySelectorAll('.stat-card h3');

    if (statCards[0]) {
        statCards[0].textContent = stats.byod_inside || 0;
    }
    if (statCards[1]) {
        statCards[1].textContent = stats.kc_inside || 0;
    }
    if (statCards[2]) {
        statCards[2].textContent = stats.total_today || 0;
    }
    if (statCards[3]) {
        statCards[3].textContent = stats.avg_duration || '0h';
    }
}

// ==================== HELPER FUNCTIONS ====================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function formatTime(timeString) {
    if (!timeString) return '-';

    const timePart = timeString.split('.')[0];
    const [hours, minutes] = timePart.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// function calculateDuration(timeIn, timeOut) {
//     if (!timeIn) return '-';

//     const inTime = new Date(`2000-01-01 ${timeIn}`);
//     const outTime = timeOut ? new Date(`2000-01-01 ${timeOut}`) : new Date();

//     if (!timeOut) {
//         // Calculate current duration
//         const now = new Date();
//         const diff = now - inTime;
//         const hours = Math.floor(diff / (1000 * 60 * 60));
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//         return `${hours}h ${minutes}m`;
//     }

//     const diff = outTime - inTime;
//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//     return `${hours}h ${minutes}m`;
// }

function showEmptyState(tabId, message) {
    const tbody = document.querySelector(`#${tabId} tbody`);
    if (tbody) {
        
        let colspan;
        if (tabId === 'all-logs') {
            colspan = 6; 
        } else if (tabId === 'lab1-logs' || tabId === 'lab2-logs' || tabId === 'active-logs') {
            colspan = 7;
        } else {
            colspan = 5; // Default fallback
        }
        
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="text-center py-4">${message}</td></tr>`;
    }
}

// ==================== FILTER SETUP ====================
function setupFilters() {
    // Load BYOD logs when tab is clicked
    document.getElementById('lab1-tab')?.addEventListener('click', () => {
        loadBYODLogs();
    });

    // Load Knowledge Center logs when tab is clicked
    document.getElementById('lab2-tab')?.addEventListener('click', () => {
        loadKnowledgeCenterLogs();
    });

    // Load active users when tab is clicked
    document.getElementById('active-tab')?.addEventListener('click', () => {
        loadActiveUsers();
    });
}

// ==================== EXPORT FUNCTIONALITY ====================
async function exportToExcel() {
    try {
        window.location.href = "/SoftEngProject/src/php/admin/log.php?action=export_excel";
    } catch (error) {
        console.error("Error exporting:", error);
        alert("Failed to export data");
    }
}

// Sidebar toggle
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}