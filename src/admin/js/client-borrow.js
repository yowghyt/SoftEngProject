// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    loadEquipmentItems();

    function loadEquipmentItems() {
    fetch("../php/admin/get_equipment.php")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("equipmentContainer");
            container.innerHTML = ""; 

            data.forEach(item => {
                const statusBadge = item.status === "Available"
                    ? `<span class="badge bg-success">Available</span>`
                    : `<span class="badge bg-danger">Borrowed</span>`;

                const disabledBtn = item.status === "Available"
                    ? ""
                    : "disabled";

                container.innerHTML += `
                    <div class="col-md-4 col-lg-3 mb-4">
                        <div class="item-card">
                            <div class="item-image">📦</div>
                            <div class="item-body">
                                <h5>${item.equipmentName}</h5>
                                <p class="item-id">${item.equipmentId}</p>
                                <p class="item-category"><span class="badge bg-primary">${item.category}</span></p>
                                <div class="item-status">${statusBadge}</div>
                                <button class="btn btn-primary w-100 mt-2" data-bs-toggle="modal" data-bs-target="#borrowModal" ${disabledBtn}>
                                    Request Borrow
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });

            attachBorrowEventListeners();
        });
}

    // Create Borrow Modal HTML
    const borrowModalHTML = `
    <div class="modal fade" id="borrowModal" tabindex="-1" aria-labelledby="borrowModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="borrowModalLabel">Request Item Borrow</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="row">
                        <div class="col-md-6 mb-3">
                                <label class="form-label">Student ID <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="borrowStudentId" placeholder="Enter your student ID" required>
                                <input type="hidden" id="realUserId">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Student Name <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="borrowStudentName" placeholder="Enter your full name" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Item Name</label>
                            <input type="text" class="form-control" id="borrowItemName" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Item ID</label>
                            <input type="text" class="form-control" id="borrowItemId" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Borrow Duration (Days)</label>
                            <select class="form-select" id="borrowDuration">
                                <option>1 days</option>
                                <option>2 days</option>
                                <option>3 days</option>
                                <option>5 days</option>
                                <option selected>7 days</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Purpose of Borrowing <span class="text-danger">*</span></label>
                            <textarea class="form-control" id="borrowPurpose" rows="3" placeholder="Please describe the purpose..." required></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="submitBorrowBtn">Submit Request</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Create Reserve Modal HTML
    const reserveModalHTML = `
    <div class="modal fade" id="reserveModal" tabindex="-1" aria-labelledby="reserveModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="reserveModalLabel">Reserve Room</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                    <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Student Name <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="borrowStudentName" placeholder="Enter your full name" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Student ID <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="borrowStudentId" placeholder="Enter your student ID" required>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Room Name</label>
                            <input type="text" class="form-control" id="reserveRoomName" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Date</label>
                            <input type="date" class="form-control" id="reserveDate">
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Start Time</label>
                                <input type="time" class="form-control" id="reserveStartTime">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">End Time</label>
                                <input type="time" class="form-control" id="reserveEndTime">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Number of People</label>
                            <input type="number" class="form-control" id="reserveNumPeople" min="1" max="10" value="1">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Purpose of Reservation</label>
                            <textarea class="form-control" id="reservePurpose" rows="3" placeholder="Please describe the purpose..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="submitReserveBtn">Submit Reservation</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Inject modals into the body
    document.body.insertAdjacentHTML('beforeend', borrowModalHTML);
    document.body.insertAdjacentHTML('beforeend', reserveModalHTML);
    
    // Get modal elements after they're injected
    const borrowModalElement = document.getElementById('borrowModal');
    const reserveModalElement = document.getElementById('reserveModal');
    
    // Initialize Bootstrap modals
    const borrowModal = new bootstrap.Modal(borrowModalElement);
    const reserveModal = new bootstrap.Modal(reserveModalElement);
    
    borrowModalElement.addEventListener("hidden.bs.modal", function () {
        document.getElementById("borrowStudentName").value = "";
        document.getElementById("borrowStudentId").value = "";
        document.getElementById("borrowPurpose").value = "";
    });
    // Get all "Request Borrow" buttons
    // const borrowButtons = document.querySelectorAll('[data-bs-target="#borrowModal"]');
    
    // Get all "Reserve Now" buttons
    const reserveButtons = document.querySelectorAll('[data-bs-target="#reserveModal"]');
    
function attachBorrowEventListeners() {
    const borrowButtons = document.querySelectorAll('[data-bs-target="#borrowModal"]');

    borrowButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const itemCard = this.closest('.item-card');

            const itemName = itemCard.querySelector('h5').textContent;
            const itemId = itemCard.querySelector('.item-id').textContent;

            document.getElementById('borrowItemName').value = itemName;
            document.getElementById('borrowItemId').value = itemId;

            borrowModal.show();
        });
    });
}
    
    // Handle reserve button clicks
    reserveButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the room card parent
            const roomCard = this.closest('.room-card');
            
            // Extract room details
            const roomName = roomCard.querySelector('h5').textContent;
            
            // Populate modal with room details
            document.getElementById('reserveRoomName').value = roomName;
            
            // Show the modal
            reserveModal.show();
        });
    });
    
    // Handle borrow form submission
     document.getElementById("submitBorrowBtn").addEventListener("click", function () {
        const userId = document.getElementById("realUserId") ? document.getElementById("realUserId").value : '';
        const equipmentId = document.getElementById("borrowItemId").value;
        const duration = parseInt(document.getElementById("borrowDuration").value);
        const purpose = document.getElementById("borrowPurpose").value.trim();

        if (!userId) {
            alert("Please enter a valid student ID (lookup must find the student).");
            return;
        }
        if (!equipmentId || !duration || !purpose) {
            alert("Please fill all required fields.");
            return;
        }

        fetch("../php/admin/submit_request.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                userId,
                equipmentId,
                duration,
                purpose
            })
        })
        .then(res => res.text())
        .then(txt => {
            console.log('RAW RESPONSE:', txt);
            let data;
            try {
                data = JSON.parse(txt);
            } catch (e) {
                alert('Invalid JSON from server:\n' + txt);
                return;
            }

            if (data.success) {
                alert('Borrow request submitted!');
                borrowModal.hide();
                loadEquipmentItems();
            } else {
                alert('Error: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Submit error:', err);
            alert('Network error while submitting request.');
        });
    });
    
    // Handle reserve form submission
    document.getElementById('submitReserveBtn').addEventListener('click', function() {
        const date = document.getElementById('reserveDate').value;
        const startTime = document.getElementById('reserveStartTime').value;
        const endTime = document.getElementById('reserveEndTime').value;
        const numPeople = document.getElementById('reserveNumPeople').value;
        const purpose = document.getElementById('reservePurpose').value;
        
        // Validation
        if (!date || !startTime || !endTime || !purpose.trim()) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (startTime >= endTime) {
            alert('End time must be after start time');
            return;
        }
        
        // Success message
        alert('Room reservation submitted successfully!');
        
        // Close modal
        reserveModal.hide();
        
        // Reset form
        document.getElementById('reserveDate').value = '';
        document.getElementById('reserveStartTime').value = '';
        document.getElementById('reserveEndTime').value = '';
        document.getElementById('reserveNumPeople').value = '1';
        document.getElementById('reservePurpose').value = '';
    });
    
    // Search functionality
    const searchInput = document.querySelector('input[placeholder*="Search items"]');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const itemCards = document.querySelectorAll('.item-card');
            
            itemCards.forEach(card => {
                const itemName = card.querySelector('h5').textContent.toLowerCase();
                const itemId = card.querySelector('.item-id').textContent.toLowerCase();
                
                if (itemName.includes(searchTerm) || itemId.includes(searchTerm)) {
                    card.closest('.col-md-4').style.display = '';
                } else {
                    card.closest('.col-md-4').style.display = 'none';
                }
            });
        });
    }
    
    // Category filter
    const categoryFilter = document.querySelectorAll('.form-select')[0];
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const selectedCategory = this.value;
            const itemCards = document.querySelectorAll('.item-card');
            
            itemCards.forEach(card => {
                const categoryBadge = card.querySelector('.badge.bg-primary');
                if (categoryBadge) {
                    const category = categoryBadge.textContent;
                    
                    if (selectedCategory === 'All Categories' || category === selectedCategory) {
                        card.closest('.col-md-4').style.display = '';
                    } else {
                        card.closest('.col-md-4').style.display = 'none';
                    }
                }
            });
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update active nav link
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            }
        });
    });

     function enableStudentAutoFill() {
        const nameInput = document.getElementById("borrowStudentName");
        const idInput = document.getElementById("borrowStudentId");

        if (!nameInput || !idInput) return;

        function lookupStudent(query) {
            if (query.length < 2) return;

            fetch(`../php/admin/lookup_student.php?query=${query}`)
                .then(res => res.json())
                .then(data => {
                   if (data.error) return;

            if (data.fullname) nameInput.value = data.fullname;
            if (data.idNumber) idInput.value = data.idNumber;

            // get userId
            if (data.userId) {
                document.getElementById("realUserId").value = data.userId;
            }
        });
        }

        nameInput.addEventListener("input", () => lookupStudent(nameInput.value));
        idInput.addEventListener("input", () => lookupStudent(idInput.value));
    }

    enableStudentAutoFill();
});
