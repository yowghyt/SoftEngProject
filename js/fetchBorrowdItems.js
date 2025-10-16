document.addEventListener("DOMContentLoaded", () => {
  console.log("Fetching borrowed items...");

  fetch("get_borrowed_items.php")
    .then(response => response.json())
    .then(data => {
      console.log("Fetched data:", data);

      const tbody = document.querySelector("#inventory tbody");
      tbody.innerHTML = "";

      data.forEach(item => {
        const borrowedDate = new Date(item.borrowedDate);
        const dueDate = new Date(item.dueDate);
        const daysLeft = Math.ceil((dueDate - borrowedDate) / (1000 * 60 * 60 * 24));

        const row = `
          <tr>
            <td>#IT-${String(item.equipmentId).padStart(3, '0')}</td>
            <td>${item.equipmentName}</td>
            <td><strong>${item.studentId}</strong></td>
            <td>${item.borrowerName}</td>
            <td>${borrowedDate.toDateString()}</td>
            <td>${dueDate.toDateString()}</td>
            <td><span class="badge bg-success">${item.status}</span></td>
            <td><span class="badge bg-info">${daysLeft} days</span></td>
            <td>
              <button class="btn btn-sm btn-primary">Details</button>
              <button class="btn btn-sm btn-warning">Extend</button>
            </td>
          </tr>`;
        tbody.innerHTML += row;
      });
    })
    .catch(err => console.error("Error loading data:", err));
});
