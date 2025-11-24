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
                console.log('Creating row for item:', item);
                
                const row = document.createElement('tr');

                const statusClass = item.actualStatus === 'Overdue' ? 'bg-danger' : 'bg-success';

                row.innerHTML = `
                    <td>#ITM-${String(item.equipmentId).padStart(3, '0')}</td>
                    <td>${item.equipmentName}</td>
                    <td>${item.borrowerName} (${item.idNumber})</td>
                    <td>${formatDate(item.dueDate)}</td>
                    <td><span class="badge ${statusClass}">${item.actualStatus}</span></td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="returnItem(this, ${item.reservationId}, '${item.equipmentName.replace(/'/g, "\\'")}')">
                            Return
                        </button>
                    </td>
                `;

                tbody.appendChild(row);
                
                console.log('Row added with Return button');
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
                            <td colspan="7" class="text-center text-muted py-4">No active room reservations</td>
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
                    <td>${formatDate(room.date)}</td>
                    <td>${formatTime(room.startTime)}</td>
                    <td>${formatTime(room.endTime)}</td>
                    <td><span class="badge ${statusClass}">${room.actualStatus}</span></td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="completeRoomReservation(${room.reservationId}, '${room.roomName}')">
                            Complete
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

                const currentItems = borrower.currentBorrows > 0 ?
                    `${borrower.currentBorrows} item(s)` : 'None';

                row.innerHTML = `
                    <td>#BOR-${String(index + 1).padStart(3, '0')}</td>
                    <td>${borrower.idNumber}</td>
                    <td>${borrower.fullName}</td>
                    <td>${borrower.totalBorrows}</td>
                    <td>${currentItems}</td>
                    <td>${borrower.lastBorrowed ? formatDate(borrower.lastBorrowed) : 'Never'}</td>
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
        const colspan = sectionId === 'inventory' ? 6 : sectionId === 'rooms' ? 7 : 8;
        tbody.innerHTML = `
            <tr>
                <td colspan="${colspan}" class="text-center text-muted py-4">${message}</td>
            </tr>
        `;
    }
}

// ==================== RETURN ITEM FUNCTION ====================
function returnItem(button, reservationId, equipmentName) {
    if (confirm(`Are you sure you want to mark "${equipmentName}" as returned?\n\nReservation ID: ${reservationId}`)) {
        // Show loading state
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Processing...';
        
        fetch('/SoftEngProject/src/php/admin/pending.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'return_equipment', 
                reservationId: reservationId
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === "success") { 
                alert(`Success! "${equipmentName}" has been marked as returned.`);
                loadBorrowedItems();
                loadDashboardStats();
            } else {
                alert(`Error: ${result.message}`);
                button.disabled = false;
                button.textContent = originalText;
            }
        })
        .catch(error => {
            console.error('Error returning item:', error);
            alert('An error occurred while processing the return. Please try again.');
            button.disabled = false;
            button.textContent = originalText;
        });
    }
}

// ==================== COMPLETE ROOM RESERVATION FUNCTION ====================
function completeRoomReservation(reservationId, roomName) {
    if (confirm(`Mark room reservation "${roomName}" as completed?\n\nReservation ID: ${reservationId}`)) {
        fetch('/SoftEngProject/src/php/admin/pending.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'complete_room_reservation',
                reservationId: reservationId
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === "success") {
                alert(`Room reservation for "${roomName}" has been marked as completed.`);
                loadActiveRooms();
                loadDashboardStats();
            } else {
                alert(`Error: ${result.message}`);
            }
        })
        .catch(error => {
            console.error('Error completing room reservation:', error);
            alert('An error occurred while completing the reservation. Please try again.');
        });
    }
}

// ==================== SIDEBAR TOGGLE ====================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}
