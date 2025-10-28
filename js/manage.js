// Manage Inventory JavaScript Functions

// Wait for DOM and Bootstrap to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Manage Inventory page loaded');
    
    // Ensure Bootstrap is loaded
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap JS is not loaded!');
        return;
    }
    
    // Initialize all modals
    const modalElements = document.querySelectorAll('.modal');
    modalElements.forEach(modalEl => {
        new bootstrap.Modal(modalEl, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
    });
    
    // Initialize tabs
    const triggerTabList = document.querySelectorAll('button[data-bs-toggle="tab"]');
    triggerTabList.forEach(triggerEl => {
        const tabTrigger = new bootstrap.Tab(triggerEl);
        
        triggerEl.addEventListener('click', event => {
            event.preventDefault();
            tabTrigger.show();
        });
    });
    
    console.log('Bootstrap components initialized');
});

// ITEM FUNCTIONS
function addItem() {
    // Get form values
    const itemName = document.getElementById('itemName').value;
    const itemCategory = document.getElementById('itemCategory').value;
    const itemBrand = document.getElementById('itemBrand').value;
    const itemQuantity = document.getElementById('itemQuantity').value;
    const itemCondition = document.getElementById('itemCondition').value;
    const itemStatus = document.getElementById('itemStatus').value;
    const itemDescription = document.getElementById('itemDescription').value;

    // Validate form
    if (!itemName || !itemCategory || !itemBrand || !itemQuantity || !itemCondition || !itemStatus) {
        alert('Please fill in all required fields');
        return;
    }

    // Here you would typically send this data to your backend
    console.log('Adding item:', {
        name: itemName,
        category: itemCategory,
        brand: itemBrand,
        quantity: itemQuantity,
        condition: itemCondition,
        status: itemStatus,
        description: itemDescription
    });

    // Show success message
    showAlert('Item added successfully!', 'success');

    // Close modal properly
    const modalEl = document.getElementById('addItemModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
        modal.hide();
    }

    // Reset form
    document.getElementById('addItemForm').reset();

    // Optional: Reload table
    // reloadItemsTable();
}

function updateItem() {
    // Get form values
    const itemName = document.getElementById('editItemName').value;
    const itemCategory = document.getElementById('editItemCategory').value;
    const itemBrand = document.getElementById('editItemBrand').value;
    const itemQuantity = document.getElementById('editItemQuantity').value;
    const itemCondition = document.getElementById('editItemCondition').value;
    const itemStatus = document.getElementById('editItemStatus').value;
    const itemDescription = document.getElementById('editItemDescription').value;

    // Here you would typically send this data to your backend
    console.log('Updating item:', {
        name: itemName,
        category: itemCategory,
        brand: itemBrand,
        quantity: itemQuantity,
        condition: itemCondition,
        status: itemStatus,
        description: itemDescription
    });

    // Show success message
    showAlert('Item updated successfully!', 'success');

    // Close modal properly
    const modalEl = document.getElementById('editItemModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
        modal.hide();
    }

    // Optional: Reload table
    // reloadItemsTable();
}

function deleteItem(itemId) {
    if (confirm(`Are you sure you want to delete item ${itemId}?`)) {
        // Here you would typically send delete request to backend
        console.log('Deleting item:', itemId);

        // Show success message
        showAlert('Item deleted successfully!', 'success');

        // Optional: Reload table
        // reloadItemsTable();
    }
}

// ROOM FUNCTIONS
function addRoom() {
    // Get form values
    const roomName = document.getElementById('roomName').value;
    const roomBuilding = document.getElementById('roomBuilding').value;
    const roomFloor = document.getElementById('roomFloor').value;
    const roomCapacity = document.getElementById('roomCapacity').value;
    const roomEquipment = document.getElementById('roomEquipment').value;
    const roomStatus = document.getElementById('roomStatus').value;
    const roomDescription = document.getElementById('roomDescription').value;

    // Validate form
    if (!roomName || !roomBuilding || !roomFloor || !roomCapacity || !roomEquipment || !roomStatus) {
        alert('Please fill in all required fields');
        return;
    }

    // Here you would typically send this data to your backend
    console.log('Adding room:', {
        name: roomName,
        building: roomBuilding,
        floor: roomFloor,
        capacity: roomCapacity,
        equipment: roomEquipment,
        status: roomStatus,
        description: roomDescription
    });

    // Show success message
    showAlert('Room added successfully!', 'success');

    // Close modal properly
    const modalEl = document.getElementById('addRoomModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
        modal.hide();
    }

    // Reset form
    document.getElementById('addRoomForm').reset();

    // Optional: Reload table
    // reloadRoomsTable();
}

function updateRoom() {
    // Get form values
    const roomName = document.getElementById('editRoomName').value;
    const roomBuilding = document.getElementById('editRoomBuilding').value;
    const roomFloor = document.getElementById('editRoomFloor').value;
    const roomCapacity = document.getElementById('editRoomCapacity').value;
    const roomEquipment = document.getElementById('editRoomEquipment').value;
    const roomStatus = document.getElementById('editRoomStatus').value;
    const roomDescription = document.getElementById('editRoomDescription').value;

    // Here you would typically send this data to your backend
    console.log('Updating room:', {
        name: roomName,
        building: roomBuilding,
        floor: roomFloor,
        capacity: roomCapacity,
        equipment: roomEquipment,
        status: roomStatus,
        description: roomDescription
    });

    // Show success message
    showAlert('Room updated successfully!', 'success');

    // Close modal properly
    const modalEl = document.getElementById('editRoomModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
        modal.hide();
    }

    // Optional: Reload table
    // reloadRoomsTable();
}

function deleteRoom(roomId) {
    if (confirm(`Are you sure you want to delete room ${roomId}?`)) {
        // Here you would typically send delete request to backend
        console.log('Deleting room:', roomId);

        // Show success message
        showAlert('Room deleted successfully!', 'success');

        // Optional: Reload table
        // reloadRoomsTable();
    }
}

// UTILITY FUNCTIONS
function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-floating alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Add to body
    document.body.appendChild(alertDiv);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 3000);
}

// Optional: Functions to reload tables from backend
function reloadItemsTable() {
    // Fetch items from backend and update table
    console.log('Reloading items table...');
}

function reloadRoomsTable() {
    // Fetch rooms from backend and update table
    console.log('Reloading rooms table...');
}