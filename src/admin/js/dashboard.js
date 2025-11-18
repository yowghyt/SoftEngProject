// dashboard.js - Dynamic Dashboard Data Loading
document.addEventListener('DOMContentLoaded', function () {
    console.log('Dashboard initialized');
    loadDashboardStats();
    loadBorrowedItems();
    loadActiveRooms();
    loadBorrowerHistory();

    // Refresh data every 60 seconds
    setInterval(() => {
        loadDashboardStats();
        loadBorrowedItems();
        loadActiveRooms();
    }, 60000);
});

// ==================== LOAD DASHBOARD STATISTICS ====================
async function loadDashboardStats() {
    try {
        const response = await fetch('/SoftEngProject/src/php/admin/get_dashboard_stats.php');
        const result = await response.json();

        console.log('Dashboard stats:', result);

        if (result.success) {
            const stats = result.data;

            // Update stat cards
            const statCards = document.querySelectorAll('.stat-card');
            
            // Total Items Card
            if (statCards[0]) {
                statCards[0].querySelector('h3').textContent = stats.totalItems;
                statCards[0].querySelector('small').textContent = 
                    `${stats.borrowedItems} currently borrowed`;
            }

            // Active Borrowers Card
            if (statCards[1]) {
                statCards[1].querySelector('h3').textContent = stats.activeBorrowers;
                statCards[1].querySelector('small').textContent = 
                    `Out of ${stats.totalUsers} registered`;
            }

            // Room Reservations Card
            if (statCards[2]) {
                statCards[2].querySelector('h3').textContent = stats.roomReservationsToday;
            }

            // Overdue Items Card
            if (statCards[3]) {
                statCards[3].querySelector('h3').textContent = stats.overdueItems;
            }
        } else {
            console.error('Error loading stats:', result.message);
            showStatsError();
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showStatsError();
    }
}

function showStatsError() {
    const statCards = document.querySelectorAll('.stat-card h3');
    statCards.forEach(card => {
        card.textContent = 'Error';
    });
}

// ==================== LOAD BORROWED ITEMS ====================
async function loadBorrowedItems() {
    try {
        const response = await fetch('/SoftEngProject/src/php/admin/get_borrowed_items.php');
        const result = await response.json();

        console.log('Borrowed items:', result);

        if (result.success) {
            const tbody = document.querySelector('#inventory tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-4">No items currently borrowed</td>
                    </tr>
                `;
                return;
            }

            result.data.forEach(item => {
                const row = document.createElement('tr');

                const statusClass = item.actualStatus === 'Overdue' ? 'bg-danger' : 'bg-success';
                const buttonClass = item.actualStatus === 'Overdue' ? 'btn-danger' : 'btn-primary';
                const buttonText = item.actualStatus === 'Overdue' ? 'Alert' : 'Details';

                row.innerHTML = `
                    <td>#ITM-${String(item.equipmentId).padStart(3, '0')}</td>
                    <td>${item.equipmentName}</td>
                    <td>${item.borrowerName} (${item.idNumber})</td>
                    <td>${formatDate(item.dueDate)}</td>
                    <td><span class="badge ${statusClass}">${item.actualStatus}</span></td>
                    <td>
                        <button class="btn btn-sm ${buttonClass}" onclick="viewItemDetails(${item.reservationId})">
                            ${buttonText}
                        </button>
                    </td>
                `;

                tbody.appendChild(row);
            });
        } else {
            console.error('Error loading borrowed items:', result.message);
            showEmptyState('inventory', 'Failed to load borrowed items');
        }
    } catch (error) {
        console.error('Error loading borrowed items:', error);
        showEmptyState('inventory', 'Failed to load borrowed items');
    }
}

// ==================== LOAD ACTIVE ROOMS ====================
async function loadActiveRooms() {
    try {
        const response = await fetch('/SoftEngProject/src/php/admin/get_active_rooms.php');
        const result = await response.json();

        console.log('Active rooms:', result);

        if (result.success) {
            const tbody = document.querySelector('#rooms tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-4">No active room reservations</td>
                    </tr>
                `;
                return;
            }

            result.data.forEach(room => {
                const row = document.createElement('tr');

                const statusClass = room.actualStatus === 'Active' ? 'bg-success' :
                    room.actualStatus === 'Upcoming' ? 'bg-warning text-dark' : 'bg-info';

                row.innerHTML = `
                    <td>${room.roomName}</td>
                    <td>${room.userName} (${room.idNumber})</td>
                    <td>${formatTime(room.startTime)}</td>
                    <td>${formatTime(room.endTime)}</td>
                    <td><span class="badge ${statusClass}">${room.actualStatus}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewRoomDetails(${room.reservationId})">
                            Details
                        </button>
                    </td>
                `;

                tbody.appendChild(row);
            });
        } else {
            console.error('Error loading active rooms:', result.message);
            showEmptyState('rooms', 'Failed to load active rooms');
        }
    } catch (error) {
        console.error('Error loading active rooms:', error);
        showEmptyState('rooms', 'Failed to load active rooms');
    }
}

// ==================== LOAD BORROWER HISTORY ====================
async function loadBorrowerHistory() {
    try {
        const response = await fetch('/SoftEngProject/src/php/admin/get_borrower_history.php');
        const result = await response.json();

        console.log('Borrower history:', result);

        if (result.success) {
            const tbody = document.querySelector('#all-borrowers tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center text-muted py-4">No borrower history available</td>
                    </tr>
                `;
                return;
            }

            result.data.forEach((borrower, index) => {
                const row = document.createElement('tr');

                const statusClass = borrower.status === 'Delinquent' ? 'bg-danger' :
                    borrower.status === 'Active' ? 'bg-success' : 'bg-secondary';

                const currentItems = borrower.currentBorrows > 0 ?
                    `${borrower.currentBorrows} item(s)` : 'None';

                row.innerHTML = `
                    <td>#BOR-${String(index + 1).padStart(3, '0')}</td>
                    <td>${borrower.idNumber}</td>
                    <td>${borrower.fullName}</td>
                    <td>${borrower.totalBorrows}</td>
                    <td>${currentItems}</td>
                    <td>${borrower.lastBorrowed ? formatDate(borrower.lastBorrowed) : 'Never'}</td>
                    <td><span class="badge ${statusClass}">${borrower.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewBorrowerDetails(${borrower.userId})">
                            View
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="viewBorrowerHistory(${borrower.userId})">
                            History
                        </button>
                    </td>
                `;

                tbody.appendChild(row);
            });
        } else {
            console.error('Error loading borrower history:', result.message);
            showEmptyState('borrowers', 'Failed to load borrower history');
        }
    } catch (error) {
        console.error('Error loading borrower history:', error);
        showEmptyState('borrowers', 'Failed to load borrower history');
    }
}

// ==================== UTILITY FUNCTIONS ====================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    if (!timeString) return 'N/A';
    
    // Remove milliseconds if present
    const timePart = timeString.split('.')[0];
    const [hours, minutes] = timePart.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function showEmptyState(sectionId, message) {
    const tbody = document.querySelector(`#${sectionId} tbody`);
    if (tbody) {
        const colspan = sectionId === 'inventory' ? 6 : sectionId === 'rooms' ? 6 : 8;
        tbody.innerHTML = `
            <tr>
                <td colspan="${colspan}" class="text-center text-muted py-4">${message}</td>
            </tr>
        `;
    }
}

// ==================== DETAIL VIEW FUNCTIONS ====================
function viewItemDetails(reservationId) {
    alert(`Viewing details for equipment reservation ID: ${reservationId}\n\nThis feature will show:\n- Equipment details\n- Borrower information\n- Borrow/return dates\n- Purpose of borrowing`);
}

function viewRoomDetails(reservationId) {
    alert(`Viewing details for room reservation ID: ${reservationId}\n\nThis feature will show:\n- Room information\n- User details\n- Time slot\n- Purpose of reservation`);
}

function viewBorrowerDetails(userId) {
    alert(`Viewing profile for user ID: ${userId}\n\nThis feature will show:\n- Student information\n- Contact details\n- Current borrowed items\n- Borrowing history`);
}

function viewBorrowerHistory(userId) {
    alert(`Viewing borrowing history for user ID: ${userId}\n\nThis feature will show:\n- All past borrowings\n- Return dates\n- Late returns\n- Frequency of borrowing`);
}

// ==================== SIDEBAR TOGGLE ====================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}