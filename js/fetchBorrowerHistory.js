document.addEventListener("DOMContentLoaded", () => {
  console.log("Fetching borrower history...");

  fetch("php/get_borrower_history.php")
    .then(response => response.json())
    .then(data => {
      console.log("Fetched borrowers:", data);
      // ---- TAB 1: All Borrowers ----
      const tbody = document.querySelector("#all-borrowers tbody");
      tbody.innerHTML = "";

      data.forEach(item => {
        const statusBadge = item.status === "Approved" 
          ? '<span class="badge bg-success">Active</span>'
          : (item.status === "Pending"
            ? '<span class="badge bg-warning">Pending</span>'
            : '<span class="badge bg-danger">Delinquent</span>');

        const due = new Date(item.dueDate);
        const row = `
          <tr>
            <td>${item.borrowerId}</td>
            <td><strong>${item.studentId}</strong></td>
            <td>${item.name}</td>
            <td>${item.totalBorrows}</td>
            <td>1 (${item.itemBorrowed})</td>
            <td>${due.toLocaleDateString()}</td>
            <td>${statusBadge}</td>
            <td>
              <button class="btn btn-sm btn-primary">View Profile</button>
              <button class="btn btn-sm btn-secondary">History</button>
            </td>
          </tr>
        `;
        tbody.innerHTML += row;
      });

       // ---- TAB 2: Frequent Borrowers (totalBorrows >= 3) ----
      const freqBody = document.querySelector("#frequent-borrowers tbody");
      freqBody.innerHTML = "";

      const frequent = data.filter(b => b.totalBorrows >= 3);

      frequent.forEach(item => {
        const row = `
          <tr>
            <td>${item.borrowerId}</td>
            <td><strong>${item.studentId}</strong></td>
            <td>${item.name}</td>
            <td>${item.totalBorrows}</td>
            <td>${item.itemBorrowed}</td>
            <td>
              <button class="btn btn-sm btn-primary">View Profile</button>
            </td>
          </tr>
        `;
        freqBody.innerHTML += row;
      });

      // ---- TAB 3: Delinquent Borrowers (status = 'Delinquent') ----
      const delinBody = document.querySelector("#delinquent-borrowers tbody");
      delinBody.innerHTML = "";

      const delinquent = data.filter(b => b.status === "Delinquent");

      delinquent.forEach(item => {
        const due = new Date(item.dueDate);

        const row = `
          <tr>
            <td>${item.borrowerId}</td>
            <td><strong>${item.studentId}</strong></td>
            <td>${item.name}</td>
            <td>${item.itemBorrowed}</td>
            <td>${due.toLocaleDateString()}</td>
            <td><span class="badge bg-danger">Delinquent</span></td>
            <td>
              <button class="btn btn-sm btn-secondary">History</button>
            </td>
          </tr>
        `;
        delinBody.innerHTML += row;
      });

    })
    .catch(err => console.error("Error loading borrower data:", err));
});
