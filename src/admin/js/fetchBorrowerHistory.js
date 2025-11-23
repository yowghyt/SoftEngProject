document.addEventListener("DOMContentLoaded", () => {
  console.log("Fetching borrower history...");

  fetch("../php/admin/get_borrower_history.php")
    .then(response => response.json())
    .then(result => {
      console.log("Fetched borrower history:", result);

      if (!result.success) {
        console.error("Error:", result.message);
        return;
      }

      const data = result.data;
      const tbody = document.querySelector("#borrowers tbody");
      tbody.innerHTML = "";

      if (data.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-4">No borrower history found.</td>
          </tr>
        `;
        return;
      }

      data.forEach(item => {
        // Status Badge
        let statusBadge = "";
        if (item.status === "Active") {
          statusBadge = `<span class="badge bg-success">Active</span>`;
        } else if (item.status === "Delinquent") {
          statusBadge = `<span class="badge bg-danger">Delinquent</span>`;
        } else {
          statusBadge = `<span class="badge bg-secondary">Inactive</span>`;
        }

        // Last Borrowed Date
        let last = item.lastBorrowed
          ? new Date(item.lastBorrowed).toLocaleDateString()
          : "—";

        const row = `
          <tr>
            <td>${item.userId}</td>
            <td><strong>${item.idNumber}</strong></td>
            <td>${item.fullName}</td>
            <td>${item.totalBorrows}</td>
            <td>${item.currentBorrows} (${item.currentItems || "None"})</td>
            <td>${last}</td>
            <td>${statusBadge}</td>
          </tr>
        `;

        tbody.innerHTML += row;
      });
    })
    .catch(err => console.error("Error loading borrower data:", err));
});
