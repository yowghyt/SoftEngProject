document.addEventListener("DOMContentLoaded", () => {
    loadEquipment();
    loadRooms();
});

// ==================== LOAD EQUIPMENT ====================
async function loadEquipment() {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/manage.php?action=get_equipment");
        const result = await response.json();

        if (result.status === "success") {
            displayEquipment(result.data);
        } else {
            console.error("Error:", result.message);
            showEmptyEquipmentState();
        }
    } catch (error) {
        console.error("Error loading equipment:", error);
        showEmptyEquipmentState();
    }
}

function displayEquipment(equipment) {
    const tbody = document.querySelector('#items-section tbody');

    if (equipment.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No equipment found</td></tr>';
        return;
    }

    tbody.innerHTML = equipment.map(item => {
        const statusBadge = item.status === 'Available' ?
            '<span class="badge bg-success">Available</span>' :
            '<span class="badge bg-warning text-dark">Not Available</span>';

        return `
            <tr>
                <td>#IT-${String(item.equipmentId).padStart(3, '0')}</td>
                <td>${item.equipmentName}</td>
                <td>${item.category || 'N/A'}</td>
                <td>${item.brand || 'N/A'}</td>
                <td>${item.quantity}</td>
                <td>${item.available || item.quantity}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewEquipment(${item.equipmentId})">View</button>
                    <button class="btn btn-sm btn-warning" onclick="editEquipment(${item.equipmentId})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEquipment(${item.equipmentId})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function showEmptyEquipmentState() {
    const tbody = document.querySelector('#items-section tbody');
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Failed to load equipment</td></tr>';
}

// ==================== LOAD ROOMS ====================
async function loadRooms() {
    try {
        const response = await fetch("/SoftEngProject/src/php/admin/manage.php?action=get_rooms");
        const result = await response.json();

        if (result.status === "success") {
            displayRooms(result.data);
        } else {
            console.error("Error:", result.message);
            showEmptyRoomState();
        }
    } catch (error) {
        console.error("Error loading rooms:", error);
        showEmptyRoomState();
    }
}

function displayRooms(rooms) {
    const tbody = document.querySelector('#rooms-section tbody');

    if (rooms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No rooms found</td></tr>';
        return;
    }

    tbody.innerHTML = rooms.map(room => {
        let statusBadge;
        if (room.status === 'Available') {
            statusBadge = '<span class="badge bg-success">Available</span>';
        } else if (room.status === 'Reserved') {
            statusBadge = '<span class="badge bg-warning text-dark">Reserved</span>';
        } else {
            statusBadge = '<span class="badge bg-danger">Not Available</span>';
        }

        return `
            <tr>
                <td>#ROOM-${String(room.roomId).padStart(3, '0')}</td>
                <td>${room.roomName}</td>
                <td>${room.building || 'N/A'}</td>
                <td>${room.floor || 'N/A'}</td>
                <td>${room.capacity} persons</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewRoom(${room.roomId})">View</button>
                    <button class="btn btn-sm btn-warning" onclick="editRoom(${room.roomId})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.roomId})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function showEmptyRoomState() {
    const tbody = document.querySelector('#rooms-section tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Failed to load rooms</td></tr>';
}

// ==================== ADD EQUIPMENT ====================
async function addItem() {
    const equipmentName = document.getElementById('itemName').value.trim();
    const category = document.getElementById('itemCategory').value;
    const brand = document.getElementById('itemBrand').value.trim();
    const quantity = parseInt(document.getElementById('itemQuantity').value);
    const condition = document.getElementById('itemCondition').value;
    const description = document.getElementById('itemDescription').value.trim();

    if (!equipmentName || !category || !brand || !quantity || !condition) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch("/SoftEngProject/src/php/admin/manage.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "add_equipment",
                equipmentName,
                category,
                brand,
                quantity,
                condition,
                description,
                status: 'Available'
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            alert("Equipment added successfully!");
            bootstrap.Modal.getInstance(document.getElementById('addItemModal')).hide();
            document.getElementById('addItemForm').reset();
            loadEquipment();
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to add equipment");
    }
}

// ==================== VIEW EQUIPMENT ====================
async function viewEquipment(equipmentId) {
    try {
        const response = await fetch(`/SoftEngProject/src/php/admin/manage.php?action=get_equipment_details&id=${equipmentId}`);
        const result = await response.json();

        if (result.status === "success") {
            const item = result.data;

            // Populate view modal
            document.querySelector('#viewItemModal .modal-body').innerHTML = `
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <strong>Item ID:</strong>
                        <p>#IT-${String(item.equipmentId).padStart(3, '0')}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                        <strong>Item Name:</strong>
                        <p>${item.equipmentName}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <strong>Category:</strong>
                        <p>${item.category || 'N/A'}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                        <strong>Brand/Model:</strong>
                        <p>${item.brand || 'N/A'}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <strong>Quantity:</strong>
                        <p>${item.quantity}</p>
                    </div>
                    <div class="col-md-4 mb-3">
                        <strong>Available:</strong>
                        <p>${item.available || item.quantity}</p>
                    </div>
                    <div class="col-md-4 mb-3">
                        <strong>Borrowed:</strong>
                        <p>${item.quantity - (item.available || item.quantity)}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <strong>Condition:</strong>
                        <p><span class="badge bg-info">${item.condition || 'N/A'}</span></p>
                    </div>
                    <div class="col-md-6 mb-3">
                        <strong>Status:</strong>
                        <p><span class="badge bg-${item.status === 'Available' ? 'success' : 'warning'}">${item.status}</span></p>
                    </div>
                </div>
                <div class="mb-3">
                    <strong>Description:</strong>
                    <p>${item.description || 'No description available'}</p>
                </div>
            `;

            new bootstrap.Modal(document.getElementById('viewItemModal')).show();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to load equipment details");
    }
}

// ==================== EDIT EQUIPMENT ====================
let currentEditEquipmentId = null;

async function editEquipment(equipmentId) {
    currentEditEquipmentId = equipmentId;

    try {
        const response = await fetch(`/SoftEngProject/src/php/admin/manage.php?action=get_equipment_details&id=${equipmentId}`);
        const result = await response.json();

        if (result.status === "success") {
            const item = result.data;

            // Populate edit form
            document.getElementById('editItemName').value = item.equipmentName;
            document.getElementById('editItemCategory').value = item.category || '';
            document.getElementById('editItemBrand').value = item.brand || '';
            document.getElementById('editItemQuantity').value = item.quantity;
            document.getElementById('editItemCondition').value = item.condition || 'Good';
            document.getElementById('editItemDescription').value = item.description || '';

            new bootstrap.Modal(document.getElementById('editItemModal')).show();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to load equipment details");
    }
}

async function updateItem() {
    if (!currentEditEquipmentId) {
        alert('No equipment selected');
        return;
    }

    const equipmentName = document.getElementById('editItemName').value.trim();
    const category = document.getElementById('editItemCategory').value;
    const brand = document.getElementById('editItemBrand').value.trim();
    const quantity = parseInt(document.getElementById('editItemQuantity').value);
    const condition = document.getElementById('editItemCondition').value;
    const description = document.getElementById('editItemDescription').value.trim();

    if (!equipmentName || !quantity) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch("/SoftEngProject/src/php/admin/manage.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "update_equipment",
                equipmentId: currentEditEquipmentId,
                equipmentName,
                category,
                brand,
                quantity,
                condition,
                description
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            alert("Equipment updated successfully!");
            bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide();
            currentEditEquipmentId = null;
            loadEquipment();
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to update equipment");
    }
}

// ==================== DELETE EQUIPMENT ====================
async function deleteEquipment(equipmentId) {
    if (!confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch("/SoftEngProject/src/php/admin/manage.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "delete_equipment",
                equipmentId: equipmentId
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            alert("Equipment deleted successfully!");
            loadEquipment();
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to delete equipment");
    }
}

// ==================== ADD ROOM ====================
async function addRoom() {
    const roomName = document.getElementById('roomName').value.trim();
    const building = document.getElementById('roomBuilding').value.trim();
    const floor = document.getElementById('roomFloor').value.trim();
    const capacity = parseInt(document.getElementById('roomCapacity').value);
    const equipment = document.getElementById('roomEquipment').value.trim();
    const status = document.getElementById('roomStatus').value;
    const description = document.getElementById('roomDescription').value.trim();

    if (!roomName || !capacity || !status) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch("/SoftEngProject/src/php/admin/manage.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "add_room",
                roomName,
                building,
                floor,
                capacity,
                equipment,
                status,
                description
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            alert("Room added successfully!");
            bootstrap.Modal.getInstance(document.getElementById('addRoomModal')).hide();
            document.getElementById('addRoomForm').reset();
            loadRooms();
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to add room");
    }
}

// ==================== VIEW ROOM ====================
async function viewRoom(roomId) {
    try {
        const response = await fetch(`/SoftEngProject/src/php/admin/manage.php?action=get_room_details&id=${roomId}`);
        const result = await response.json();

        if (result.status === "success") {
            const room = result.data;

            document.querySelector('#viewRoomModal .modal-body').innerHTML = `
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <strong>Room Code:</strong>
                        <p>#ROOM-${String(room.roomId).padStart(3, '0')}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                        <strong>Room Name:</strong>
                        <p>${room.roomName}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <strong>Building:</strong>
                        <p>${room.building || 'N/A'}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                        <strong>Floor:</strong>
                        <p>${room.floor || 'N/A'}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <strong>Capacity:</strong>
                        <p>${room.capacity} persons</p>
                    </div>
                    <div class="col-md-6 mb-3">
                        <strong>Status:</strong>
                        <p><span class="badge bg-${room.status === 'Available' ? 'success' : 'warning'}">${room.status}</span></p>
                    </div>
                </div>
                <div class="mb-3">
                    <strong>Equipment:</strong>
                    <p>${room.equipment || 'No equipment listed'}</p>
                </div>
                <div class="mb-3">
                    <strong>Description:</strong>
                    <p>${room.description || 'No description available'}</p>
                </div>
            `;

            new bootstrap.Modal(document.getElementById('viewRoomModal')).show();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to load room details");
    }
}

// ==================== EDIT ROOM ====================
let currentEditRoomId = null;

async function editRoom(roomId) {
    currentEditRoomId = roomId;

    try {
        const response = await fetch(`/SoftEngProject/src/php/admin/manage.php?action=get_room_details&id=${roomId}`);
        const result = await response.json();

        if (result.status === "success") {
            const room = result.data;

            document.getElementById('editRoomName').value = room.roomName;
            document.getElementById('editRoomBuilding').value = room.building || '';
            document.getElementById('editRoomFloor').value = room.floor || '';
            document.getElementById('editRoomCapacity').value = room.capacity;
            document.getElementById('editRoomEquipment').value = room.equipment || '';
            document.getElementById('editRoomStatus').value = room.status;
            document.getElementById('editRoomDescription').value = room.description || '';

            new bootstrap.Modal(document.getElementById('editRoomModal')).show();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to load room details");
    }
}

async function updateRoom() {
    if (!currentEditRoomId) {
        alert('No room selected');
        return;
    }

    const roomName = document.getElementById('editRoomName').value.trim();
    const building = document.getElementById('editRoomBuilding').value.trim();
    const floor = document.getElementById('editRoomFloor').value.trim();
    const capacity = parseInt(document.getElementById('editRoomCapacity').value);
    const equipment = document.getElementById('editRoomEquipment').value.trim();
    const status = document.getElementById('editRoomStatus').value;
    const description = document.getElementById('editRoomDescription').value.trim();

    if (!roomName || !capacity) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch("/SoftEngProject/src/php/admin/manage.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "update_room",
                roomId: currentEditRoomId,
                roomName,
                building,
                floor,
                capacity,
                equipment,
                status,
                description
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            alert("Room updated successfully!");
            bootstrap.Modal.getInstance(document.getElementById('editRoomModal')).hide();
            currentEditRoomId = null;
            loadRooms();
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to update room");
    }
}

// ==================== DELETE ROOM ====================
async function deleteRoom(roomId) {
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch("/SoftEngProject/src/php/admin/manage.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "delete_room",
                roomId: roomId
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            alert("Room deleted successfully!");
            loadRooms();
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to delete room");
    }
}

// Sidebar toggle
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}