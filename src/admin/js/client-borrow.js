// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
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
                                <label class="form-label">Student Name <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="borrowStudentName" placeholder="Enter your full name" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Student ID <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="borrowStudentId" placeholder="Enter your student ID" required>
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
    
    // Get all "Request Borrow" buttons
    const borrowButtons = document.querySelectorAll('[data-bs-target="#borrowModal"]');
    
    // Get all "Reserve Now" buttons
    const reserveButtons = document.querySelectorAll('[data-bs-target="#reserveModal"]');
    
    // Handle borrow button clicks
    borrowButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the item card parent
            const itemCard = this.closest('.item-card');
            
            // Extract item details
            const itemName = itemCard.querySelector('h5').textContent;
            const itemId = itemCard.querySelector('.item-id').textContent;
            
            // Populate modal with item details
            document.getElementById('borrowItemName').value = itemName;
            document.getElementById('borrowItemId').value = itemId;
            
            // Show the modal
            borrowModal.show();
        });
    });
    
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
    document.getElementById('submitBorrowBtn').addEventListener('click', function() {
        const duration = document.getElementById('borrowDuration').value;
        const purpose = document.getElementById('borrowPurpose').value;
        
        if (!purpose.trim()) {
            alert('Please provide a purpose for borrowing');
            return;
        }
        
        // Success message
        alert('Borrow request submitted successfully!');
        
        // Close modal
        borrowModal.hide();
        
        // Reset form
        document.getElementById('borrowPurpose').value = '';
        document.getElementById('borrowDuration').selectedIndex = 2; // Reset to 7 days
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
});