document.addEventListener("DOMContentLoaded", () => {
  console.log("Fetching active room reservations...");

  fetch("php/get_active_rooms.php")
    .then(response => response.json())
    .then(data => {
      console.log("Fetched rooms:", data);

      const tbody = document.querySelector("#rooms tbody");
      tbody.innerHTML = "";

      data.forEach(item => {
        const startTime = new Date(`${item.date}T${item.startTime}`);
        const endTime = new Date(`${item.date}T${item.endTime}`);

        const row = `
          <tr>
            <td>${item.roomName}</td>
            <td>#ROOM-${String(item.roomId).padStart(3, '0')}</td>
            <td><strong>${item.studentId}</strong></td>
            <td>${item.reserverName}</td>
            <td>${startTime.toLocaleString()}</td>
            <td>${endTime.toLocaleString()}</td>
            <td>${item.capacityUsed}</td>
            <td><span class="badge bg-warning">${item.status}</span></td>
            <td>
              <button class="btn btn-sm btn-primary">View</button>
              <button class="btn btn-sm btn-info">Monitor</button>
            </td>
          </tr>`;
        tbody.innerHTML += row;
      });
    })
    .catch(err => console.error("Error loading room data:", err));
});
