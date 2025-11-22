document.addEventListener("DOMContentLoaded", () => {
    loadEquipmentRequests();
    loadRoomRequests();
    updatePendingCountBadge();
});

// ==================== LOAD EQUIPMENT REQUESTS ====================
async function loadEquipmentRequests() {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/pending.php?action=get_equipment_requests");
        const result = await response.json();

        if (result.status === "success") {
            displayEquipmentRequests(result.data);
            // Update the FIRST stat card with equipment count
            updateBorrowCount(result.count);
        } else {
            console.error("Error:", result.message);
            showEmptyState('borrow-requests', 'No pending equipment requests');
            updateBorrowCount(0);
        }
    } catch (error) {
        console.error("Error loading equipment requests:", error);
        showEmptyState('borrow-requests', 'Failed to load requests');
        updateBorrowCount(0);
    }
}

function displayEquipmentRequests(requests) {
    const tbody = document.querySelector('#borrow-requests tbody');

    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4">No pending equipment requests</td></tr>';
        return;
    }

    tbody.innerHTML = requests.map((req, index) => `
        <tr>
            <td>#REQ-${String(req.reservationId).padStart(3, '0')}</td>
            <td><strong>${req.idNumber}</strong></td>
            <td>${req.studentName}</td>
            <td>${req.equipmentName}</td>
            <td>${formatDate(req.requestedDate)}</td>
            <td>${formatDate(req.startTime)} - ${formatDate(req.dueDate)}</td>
            <td>${req.purpose}</td>
            <td><span class="badge bg-warning">Pending</span></td>
            <td>
                <button class="btn btn-sm btn-success" onclick="approveEquipment(${req.reservationId})">Approve</button>
                <button class="btn btn-sm btn-danger" onclick="rejectEquipment(${req.reservationId})">Reject</button>
                <button class="btn btn-sm btn-info" onclick="showEquipmentDetails(${req.reservationId})">Details</button>
            </td>
        </tr>
    `).join('');
}

// ==================== LOAD ROOM REQUESTS ====================
async function loadRoomRequests() {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/pending.php?action=get_room_requests");
        const result = await response.json();

        if (result.status === "success") {
            displayRoomRequests(result.data);
            // Update the SECOND stat card with room count
            updateRoomCount(result.count);
        } else {
            console.error("Error:", result.message);
            showEmptyState('room-requests', 'No pending room requests');
            updateRoomCount(0);
        }
    } catch (error) {
        console.error("Error loading room requests:", error);
        showEmptyState('room-requests', 'Failed to load requests');
        updateRoomCount(0);
    }
}

function displayRoomRequests(requests) {
    const tbody = document.querySelector('#room-requests tbody');

    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center py-4">No pending room requests</td></tr>';
        return;
    }

    tbody.innerHTML = requests.map((req, index) => `
        <tr>
            <td>#RREQ-${String(req.reservationId).padStart(3, '0')}</td>
            <td><strong>${req.idNumber}</strong></td>
            <td>${req.studentName}</td>
            <td>${req.roomName}</td>
            <td>${formatDate(req.date)}</td>
            <td>${formatTime(req.startTime)} - ${formatTime(req.endTime)}</td>
            <td>${req.attendees}</td>
            <td>${req.purpose}</td>
            <td><span class="badge bg-warning">Pending</span></td>
            <td>
                <button class="btn btn-sm btn-success" onclick="approveRoom(${req.reservationId})">Approve</button>
                <button class="btn btn-sm btn-danger" onclick="rejectRoom(${req.reservationId})">Reject</button>
                <button class="btn btn-sm btn-info" onclick="showRoomDetails(${req.reservationId})">Details</button>
            </td>
        </tr>
    `).join('');
}

// ==================== APPROVE/REJECT EQUIPMENT ====================
async function approveEquipment(reservationId) {
    if (!confirm('Are you sure you want to approve this equipment request?')) {
        return;
    }

    try {
        const response = await fetch("/SoftEngProject/src/php/admin/pending.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "approve_equipment",
                reservationId: reservationId
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            alert("Equipment request approved successfully!");
            loadEquipmentRequests();
            loadRoomRequests(); // Reload both to update counts
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to approve request");
    }
}

async function rejectEquipment(reservationId) {
    if (!confirm('Are you sure you want to reject this equipment request?')) {
        return;
    }

    try {
        const response = await fetch("/SoftEngProject/src/php/admin/pending.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "reject_equipment",
                reservationId: reservationId
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            alert("Equipment request rejected");
            loadEquipmentRequests();
            loadRoomRequests(); // Reload both to update counts
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to reject request");
    }
}

// ==================== APPROVE/REJECT ROOM ====================
async function approveRoom(reservationId) {
    if (!confirm('Are you sure you want to approve this room request?')) {
        return;
    }

    try {
        const response = await fetch("/SoftEngProject/src/php/admin/pending.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "approve_room",
                reservationId: reservationId
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            alert("Room request approved successfully!");
            loadEquipmentRequests(); // Reload both to update counts
            loadRoomRequests();
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to approve request");
    }
}

async function rejectRoom(reservationId) {
    if (!confirm('Are you sure you want to reject this room request?')) {
        return;
    }

    try {
        const response = await fetch("/SoftEngProject/src/php/admin/pending.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "reject_room",
                reservationId: reservationId
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            alert("Room request rejected");
            loadEquipmentRequests(); // Reload both to update counts
            loadRoomRequests();
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to reject request");
    }
}

// ==================== SHOW DETAILS ====================
async function showEquipmentDetails(reservationId) {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/pending.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "get_request_details",
                reservationId: reservationId,
                type: "equipment"
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            const data = result.data;
            alert(`
Equipment Request Details:
------------------------
Request ID: #REQ-${String(data.reservationId).padStart(3, '0')}
Student: ${data.studentName} (${data.idNumber})
Equipment: ${data.equipmentName}
Date Requested: ${formatDate(data.date)}
Borrow Period: ${formatDate(data.startTime)} to ${formatDate(data.dueDate)}
Purpose: ${data.purpose}
Status: ${data.status}
            `);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to load details");
    }
}

async function showRoomDetails(reservationId) {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/pending.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "get_request_details",
                reservationId: reservationId,
                type: "room"
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            const data = result.data;
            alert(`
Room Reservation Details:
------------------------
Request ID: #RREQ-${String(data.reservationId).padStart(3, '0')}
Student: ${data.studentName} (${data.idNumber})
Room: ${data.roomName}
Date: ${formatDate(data.date)}
Time: ${formatTime(data.startTime)} - ${formatTime(data.endTime)}
Attendees: ${data.capacityUsed}
Purpose: ${data.purpose}
Status: ${data.status}
            `);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to load details");
    }
}

// ==================== GET COMBINED COUNT & UPDATE BADGE ====================
// Fetches both equipment and room pending counts and returns the sum
async function getCombinedPendingCount() {
    let borrowCount = 0;
    let roomCount = 0;

    try {
        // Fetch both counts concurrently
        const [borrowResponse, roomResponse] = await Promise.all([
            fetch("/SoftEngProject/src/php/admin/pending.php?action=get_equipment_requests"), // Fetches equipment count
            fetch("/SoftEngProject/src/php/admin/pending.php?action=get_room_requests") // Fetches room count
        ]);
        
        const [borrowResult, roomResult] = await Promise.all([
            borrowResponse.json(),
            roomResponse.json()
        ]);
        
        if (borrowResult.status === "success") {
            borrowCount = borrowResult.count;
        }
        
        if (roomResult.status === "success") {
            roomCount = roomResult.count;
        }

        return borrowCount + roomCount; 
    } catch (error) {
        console.error("Error loading combined pending requests:", error);
        return 0; 
    }
}

// Updates the sidebar badge with the total count
async function updatePendingCountBadge() {
    const totalCount = await getCombinedPendingCount();
    const badge = document.getElementById('pendingCountBadge');

    if (badge) {
        badge.textContent = totalCount;
        
        // This ensures the badge is visible if there are requests
        if (totalCount > 0) {
            badge.style.display = 'inline-block';
            badge.classList.remove('bg-secondary');
            badge.classList.add('bg-danger');
        } else {
            // Optional: Change color or hide if count is zero
            badge.style.display = 'inline-block'; // Keep it visible even if 0, like your image
            badge.classList.remove('bg-danger');
            badge.classList.add('bg-secondary');
        }
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
    // Remove milliseconds if present
    const timePart = timeString.split('.')[0];
    const [hours, minutes] = timePart.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function updateBorrowCount(count) {
    // Update FIRST stat card (Equipment/Borrow Requests)
    const statCards = document.querySelectorAll('.stat-card h3');
    if (statCards[0]) {
        statCards[0].textContent = count;
    }
}

function updateRoomCount(count) {
    // Update SECOND stat card (Room Reservations)
    const statCards = document.querySelectorAll('.stat-card h3');
    if (statCards[1]) {
        statCards[1].textContent = count;
    }
}

function showEmptyState(tabId, message) {
    const tbody = document.querySelector(`#${tabId} tbody`);
    if (tbody) {
        const colspan = tabId === 'borrow-requests' ? 9 : 10;
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="text-center py-4">${message}</td></tr>`;
    }
}

// Sidebar toggle for mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}