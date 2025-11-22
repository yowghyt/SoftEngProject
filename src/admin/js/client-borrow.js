// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadEquipmentItems();
    loadRooms();
    createModals();
    enableStudentAutoFill();
    initializeSmoothScroll();
    
    // Initialize filters after a short delay to ensure DOM is ready
    setTimeout(() => {
        initializeFilters();
    }, 500);
}

// ============ INITIALIZE ALL FILTERS ============
function initializeFilters() {
    // Equipment filters
    const equipmentSearch = document.getElementById('equipmentSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');

    if (equipmentSearch) {
        equipmentSearch.addEventListener('input', filterEquipment);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterEquipment);
    }
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            sortEquipment(this.value);
        });
    }

    // Room filters
    const roomSearch = document.getElementById('roomSearch');
    const buildingFilter = document.getElementById('buildingFilter');
    const floorFilter = document.getElementById('floorFilter');
    const capacityFilter = document.getElementById('capacityFilter');

    if (roomSearch) {
        roomSearch.addEventListener('input', filterRooms);
    }
    if (buildingFilter) {
        buildingFilter.addEventListener('change', filterRooms);
    }
    if (floorFilter) {
        floorFilter.addEventListener('change', filterRooms);
    }
    if (capacityFilter) {
        capacityFilter.addEventListener('change', filterRooms);
    }
}

// ============ FILTER EQUIPMENT ============
function filterEquipment() {
    const searchInput = document.getElementById('equipmentSearch');
    const categorySelect = document.getElementById('categoryFilter');

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const category = categorySelect ? categorySelect.value : 'All Categories';

    // Target all item cards
    const itemCards = document.querySelectorAll('#equipmentContainer .item-card');
    
    itemCards.forEach(card => {
        // Get the parent column div
        const col = card.closest('.col-md-4') || card.closest('.col-lg-3') || card.parentElement;
        if (!col) return;

        const name = card.querySelector('h5')?.textContent.toLowerCase() || '';
        const id = card.querySelector('.item-id')?.textContent.toLowerCase() || '';
        const badge = card.querySelector('.item-category .badge');
        const itemCategory = badge ? badge.textContent.trim() : '';

        const matchesSearch = searchTerm === '' || name.includes(searchTerm) || id.includes(searchTerm);
        const matchesCategory = category === 'All Categories' || itemCategory === category;

        col.style.display = (matchesSearch && matchesCategory) ? '' : 'none';
    });
}

// ============ FILTER ROOMS ============
function filterRooms() {
    const searchInput = document.getElementById('roomSearch');
    const buildingSelect = document.getElementById('buildingFilter');
    const floorSelect = document.getElementById('floorFilter');
    const capacitySelect = document.getElementById('capacityFilter');

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const building = buildingSelect ? buildingSelect.value : 'All Buildings';
    const floor = floorSelect ? floorSelect.value : 'All Floors';
    const capacity = capacitySelect ? capacitySelect.value : 'Capacity';

    // Target all room cards by finding .room-card parent containers
    const roomCards = document.querySelectorAll('#roomContainer .room-card');

    roomCards.forEach(card => {
        // Get the parent column div
        const col = card.closest('.col-md-6') || card.closest('.col-lg-4') || card.parentElement;
        if (!col) return;

        const roomName = card.querySelector('h5')?.textContent || '';
        const roomNameLower = roomName.toLowerCase();
        const roomBody = card.querySelector('.room-body');
        
        // Extract values from room card
        let roomCapacity = 0;
        let roomBuilding = '';
        let roomFloor = '';

        if (roomBody) {
            const paragraphs = roomBody.querySelectorAll('p');
            paragraphs.forEach(p => {
                const text = p.textContent;
                if (text.includes('Capacity:')) {
                    const match = text.match(/(\d+)/);
                    roomCapacity = match ? parseInt(match[1]) : 0;
                }
                if (text.includes('Building:')) {
                    roomBuilding = text.split('Building:')[1]?.trim() || '';
                }
                if (text.includes('Floor:')) {
                    roomFloor = text.split('Floor:')[1]?.trim() || '';
                }
            });
        }

        // Check all filter conditions
        const matchesSearch = searchTerm === '' || roomNameLower.includes(searchTerm);
        const matchesBuilding = building === 'All Buildings' || roomBuilding.includes(building);
        
        // Floor matching
        let matchesFloor = true;
        if (floor !== 'All Floors') {
            matchesFloor = roomFloor.toLowerCase() === floor.toLowerCase();
        }
        
        // Capacity matching
        let matchesCapacity = true;
        if (capacity !== 'Capacity') {
            if (capacity === '1-10') matchesCapacity = roomCapacity >= 1 && roomCapacity <= 10;
            else if (capacity === '11-20') matchesCapacity = roomCapacity >= 11 && roomCapacity <= 20;
            else if (capacity === '21-40') matchesCapacity = roomCapacity >= 21 && roomCapacity <= 40;
            else if (capacity === '40+') matchesCapacity = roomCapacity > 40;
        }

        const showRoom = matchesSearch && matchesBuilding && matchesFloor && matchesCapacity;
        col.style.display = showRoom ? '' : 'none';
    });
}

// ============ SORT EQUIPMENT ============
function sortEquipment(sortBy) {
    const container = document.getElementById('equipmentContainer');
    if (!container) return;
    
    const items = Array.from(container.querySelectorAll('.col-md-4'));

    items.sort((a, b) => {
        const cardA = a.querySelector('.item-card');
        const cardB = b.querySelector('.item-card');
        if (!cardA || !cardB) return 0;

        if (sortBy === 'Sort by: Name') {
            const nameA = cardA.querySelector('h5')?.textContent || '';
            const nameB = cardB.querySelector('h5')?.textContent || '';
            return nameA.localeCompare(nameB);
        } 
        else if (sortBy === 'Sort by: Availability') {
            const statusA = cardA.querySelector('.item-status .badge.bg-success') ? 0 : 1;
            const statusB = cardB.querySelector('.item-status .badge.bg-success') ? 0 : 1;
            return statusA - statusB;
        } 
        else if (sortBy === 'Sort by: Category') {
            const catA = cardA.querySelector('.item-category .badge')?.textContent || '';
            const catB = cardB.querySelector('.item-category .badge')?.textContent || '';
            return catA.localeCompare(catB);
        }
        return 0;
    });

    items.forEach(item => container.appendChild(item));
    filterEquipment();
}

// ============ LOAD EQUIPMENT ============
function loadEquipmentItems() {
    fetch("../php/admin/get_equipment.php")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("equipmentContainer");
            container.innerHTML = "";

            if (data.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <p class="text-muted">No equipment items available.</p>
                    </div>`;
                return;
            }

            data.forEach((item, index) => {
                const statusBadge = item.status === "Available"
                    ? `<span class="badge bg-success">✓ Available</span>`
                    : `<span class="badge bg-danger">✗ Borrowed</span>`;

                const disabledBtn = item.status === "Available" ? "" : "disabled";
                const btnText = item.status === "Available" ? "Request Borrow" : "Currently Unavailable";

                container.innerHTML += `
                    <div class="col-md-4 col-lg-3 mb-4">
                        <div class="item-card" style="animation-delay: ${index * 0.1}s">
                            <div class="item-image">📦</div>
                            <div class="item-body">
                                <h5>${escapeHtml(item.equipmentName)}</h5>
                                <p class="item-id">#${escapeHtml(item.equipmentId)}</p>
                                <p class="item-category">
                                    <span class="badge bg-primary">${escapeHtml(item.category)}</span>
                                </p>
                                <div class="item-status">${statusBadge}</div>
                                <button class="btn btn-primary w-100 mt-2" 
                                        data-bs-toggle="modal" 
                                        data-bs-target="#borrowModal" 
                                        ${disabledBtn}>
                                    ${btnText}
                                </button>
                            </div>
                        </div>
                    </div>`;
            });

            attachBorrowEventListeners();
        })
        .catch(err => {
            console.error("Error loading equipment:", err);
            document.getElementById("equipmentContainer").innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-danger">Failed to load equipment.</p>
                </div>`;
        });
}

// ============ LOAD ROOMS ============
function loadRooms() {
    fetch("../php/admin/get_rooms.php")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("roomContainer");
            container.innerHTML = "";

            if (data.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <p class="text-muted">No rooms available.</p>
                    </div>`;
                return;
            }

            data.forEach((room, index) => {
                const statusBadge = room.status === "Available"
                    ? `<span class="badge bg-success">✓ Available</span>`
                    : `<span class="badge bg-warning">⏳ In Use</span>`;

                const disabledBtn = room.status === "Available" ? "" : "disabled";
                const btnText = room.status === "Available" ? "Reserve Now" : "Currently In Use";

                container.innerHTML += `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="room-card" data-room-id="${escapeHtml(room.roomId)}" style="animation-delay: ${index * 0.1}s">
                            <div class="room-header">
                                <h5>${escapeHtml(room.roomName)}</h5>
                                ${statusBadge}
                            </div>
                            <div class="room-body">
                                <p><strong>Capacity:</strong> ${escapeHtml(room.capacity)} persons</p>
                                <p><strong>Building:</strong> ${escapeHtml(room.building)}</p>
                                <p><strong>Floor:</strong> ${escapeHtml(room.floor)}</p>
                                <p><strong>Equipment:</strong> ${escapeHtml(room.equipment)}</p>
                                <button class="btn btn-primary w-100 mt-3" 
                                        data-room-name="${escapeHtml(room.roomName)}"
                                        data-bs-toggle="modal" 
                                        data-bs-target="#reserveModal"
                                        ${disabledBtn}>
                                    ${btnText}
                                </button>
                            </div>
                        </div>
                    </div>`;
            });

            attachReserveEventListeners();
        })
        .catch(err => {
            console.error("Error loading rooms:", err);
            document.getElementById("roomContainer").innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-danger">Failed to load rooms.</p>
                </div>`;
        });
}

// ============ CREATE MODALS ============
function createModals() {
    const borrowModalHTML = `
    <div class="modal fade" id="borrowModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">📦 Request Item Borrow</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Student ID <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="borrowStudentId" placeholder="Enter student ID">
                            <input type="hidden" id="realUserId">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Student Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="borrowStudentName" placeholder="Enter full name">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Item Name</label>
                            <input type="text" class="form-control" id="borrowItemName" readonly>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Item ID</label>
                            <input type="text" class="form-control" id="borrowItemId" readonly>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Borrow Duration</label>
                        <select class="form-select" id="borrowDuration">
                            <option value="1">1 day</option>
                            <option value="2">2 days</option>
                            <option value="3">3 days</option>
                            <option value="5">5 days</option>
                            <option value="7" selected>7 days</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Purpose <span class="text-danger">*</span></label>
                        <textarea class="form-control" id="borrowPurpose" rows="3" placeholder="Describe purpose..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="submitBorrowBtn">Submit Request</button>
                </div>
            </div>
        </div>
    </div>`;

    const reserveModalHTML = `
    <div class="modal fade" id="reserveModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">🏫 Reserve Room</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Student ID <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="reserveStudentId" placeholder="Enter student ID">
                            <input type="hidden" id="reserveUserId">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Student Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="reserveStudentName" placeholder="Enter full name">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Room Name</label>
                        <input type="text" class="form-control" id="reserveRoomName" readonly>
                        <input type="hidden" id="reserveRoomId">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Date <span class="text-danger">*</span></label>
                        <input type="date" class="form-control" id="reserveDate">
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Start Time <span class="text-danger">*</span></label>
                            <input type="time" class="form-control" id="reserveStartTime">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">End Time <span class="text-danger">*</span></label>
                            <input type="time" class="form-control" id="reserveEndTime">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Number of People <span class="text-danger">*</span></label>
                        <input type="number" class="form-control" id="reserveNumPeople" min="1" max="50" value="1">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Purpose <span class="text-danger">*</span></label>
                        <textarea class="form-control" id="reservePurpose" rows="3" placeholder="Describe purpose..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="submitReserveBtn">Submit Reservation</button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', borrowModalHTML);
    document.body.insertAdjacentHTML('beforeend', reserveModalHTML);

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reserveDate').setAttribute('min', today);

    // Modal reset listeners
    document.getElementById('borrowModal').addEventListener('hidden.bs.modal', resetBorrowModal);
    document.getElementById('reserveModal').addEventListener('hidden.bs.modal', resetReserveModal);

    // Submit listeners
    document.getElementById('submitBorrowBtn').addEventListener('click', handleBorrowSubmit);
    document.getElementById('submitReserveBtn').addEventListener('click', handleReserveSubmit);
}

// ============ EVENT LISTENERS ============
function attachBorrowEventListeners() {
    document.querySelectorAll('[data-bs-target="#borrowModal"]').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            const card = this.closest('.item-card');
            document.getElementById('borrowItemName').value = card.querySelector('h5').textContent;
            document.getElementById('borrowItemId').value = card.querySelector('.item-id').textContent.replace('#', '');
        });
    });
}

function attachReserveEventListeners() {
    document.querySelectorAll('[data-room-name]').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            const card = this.closest('.room-card');
            document.getElementById('reserveRoomName').value = this.getAttribute('data-room-name');
            document.getElementById('reserveRoomId').value = card.dataset.roomId;
        });
    });
}

// ============ FORM HANDLERS ============
function handleBorrowSubmit() {
    const userId = document.getElementById('realUserId').value;
    const studentId = document.getElementById('borrowStudentId').value.trim();
    const studentName = document.getElementById('borrowStudentName').value.trim();
    const itemId = document.getElementById('borrowItemId').value;
    const duration = document.getElementById('borrowDuration').value;
    const purpose = document.getElementById('borrowPurpose').value.trim();

    if (!studentId || !studentName || !purpose) {
        alert('Please fill all required fields.');
        return;
    }

    const btn = document.getElementById('submitBorrowBtn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    fetch("../php/admin/submit_borrow.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ userId, itemId, duration, purpose })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Borrow request submitted!');
            bootstrap.Modal.getInstance(document.getElementById('borrowModal')).hide();
            loadEquipmentItems();
        } else {
            alert('Error: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(err => alert('Failed to submit request.'))
    .finally(() => {
        btn.disabled = false;
        btn.textContent = 'Submit Request';
    });
}

function handleReserveSubmit() {
    const userId = document.getElementById('reserveUserId').value;
    const roomId = document.getElementById('reserveRoomId').value;
    const date = document.getElementById('reserveDate').value;
    const start = document.getElementById('reserveStartTime').value;
    const end = document.getElementById('reserveEndTime').value;
    const people = document.getElementById('reserveNumPeople').value;
    const purpose = document.getElementById('reservePurpose').value.trim();

    if (!userId || !roomId || !date || !start || !end || !people || !purpose) {
        alert('Please fill all required fields.');
        return;
    }

    if (start >= end) {
        alert('End time must be after start time.');
        return;
    }

    const btn = document.getElementById('submitReserveBtn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    fetch("../php/admin/submit_reservation.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ userId, roomId, date, start, end, people, purpose })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Room reservation submitted!');
            bootstrap.Modal.getInstance(document.getElementById('reserveModal')).hide();
            loadRooms();
        } else {
            alert('Error: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(err => alert('Failed to submit reservation.'))
    .finally(() => {
        btn.disabled = false;
        btn.textContent = 'Submit Reservation';
    });
}

// ============ MODAL RESET ============
function resetBorrowModal() {
    document.getElementById('borrowStudentName').value = '';
    document.getElementById('borrowStudentId').value = '';
    document.getElementById('borrowPurpose').value = '';
    document.getElementById('borrowDuration').value = '7';
    document.getElementById('realUserId').value = '';
}

function resetReserveModal() {
    document.getElementById('reserveStudentName').value = '';
    document.getElementById('reserveStudentId').value = '';
    document.getElementById('reservePurpose').value = '';
    document.getElementById('reserveDate').value = '';
    document.getElementById('reserveStartTime').value = '';
    document.getElementById('reserveEndTime').value = '';
    document.getElementById('reserveNumPeople').value = '1';
    document.getElementById('reserveUserId').value = '';
}

// ============ STUDENT AUTO-FILL ============
function enableStudentAutoFill() {
    let debounce;
    const inputs = ['borrowStudentId', 'borrowStudentName', 'reserveStudentId', 'reserveStudentName'];
    
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() {
                clearTimeout(debounce);
                debounce = setTimeout(() => lookupStudent(this.value), 300);
            });
        }
    });
}

function lookupStudent(query) {
    if (query.length < 2) return;

    fetch(`../php/admin/lookup_student.php?query=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) return;
            if (data.fullname) {
                document.getElementById('borrowStudentName').value = data.fullname;
                document.getElementById('reserveStudentName').value = data.fullname;
            }
            if (data.idNumber) {
                document.getElementById('borrowStudentId').value = data.idNumber;
                document.getElementById('reserveStudentId').value = data.idNumber;
            }
            if (data.userId) {
                document.getElementById('realUserId').value = data.userId;
                document.getElementById('reserveUserId').value = data.userId;
            }
        })
        .catch(err => console.error('Lookup failed:', err));
}

// ============ SMOOTH SCROLL ============
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });
}

// ============ UTILITY ============
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}