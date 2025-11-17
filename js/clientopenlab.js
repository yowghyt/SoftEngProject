document.addEventListener("DOMContentLoaded", () => {
    fetchCurrentVisitors();

    // Refresh every 30 seconds
    setInterval(fetchCurrentVisitors, 30000);

    function fetchCurrentVisitors() {
        fetch("php/get_current_visitors.php")
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector("#currentVisitorsTable");
                tbody.innerHTML = "";

                let totalVisitors = data.length;
                let totalDurationMinutes = 0;

                data.forEach(visitor => {
                    // Parse timeIn with date
                    const timeInDate = new Date(visitor.date + "T" + visitor.timeIn);
                    const now = new Date();
                    const durationMinutes = Math.floor((now - timeInDate) / (1000 * 60));
                    totalDurationMinutes += durationMinutes;

                    const durationStr = formatDuration(durationMinutes);
                    const timeInFormatted = formatTo12Hour(visitor.timeIn); // convert to 12-hour

                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td><strong>${visitor.studentId}</strong></td>
                        <td>${visitor.name}</td>
                        <td>${timeInFormatted}</td>
                        <td>${visitor.purpose}</td>
                        <td><span class="badge bg-success">${visitor.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="forceTimeOut('${visitor.studentId}')">Force Time Out</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

                // Update quick stats
                document.getElementById("inside-count").textContent = totalVisitors;
                document.getElementById("today-count").textContent = totalVisitors;
                const avgMinutes = totalVisitors > 0 ? Math.floor(totalDurationMinutes / totalVisitors) : 0;
                document.getElementById("avg-duration").textContent = formatDuration(avgMinutes);
                document.getElementById("capacity-current").textContent = totalVisitors;
            })
            .catch(err => console.error("Error fetching visitors:", err));
    }

    function formatDuration(minutes) {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}h ${mins}m`;
    }

    function formatTo12Hour(time24) {
        const [hourStr, minuteStr] = time24.split(":");
        let hour = parseInt(hourStr);
        const minute = minuteStr;
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12;
        if (hour === 0) hour = 12;
        return `${hour}:${minute} ${ampm}`;
    }
});

// Force Time Out (example)
function forceTimeOut(studentId) {
    if (!confirm(`Force Time Out for Student ID ${studentId}?`)) return;

    fetch("php/force_time_out.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
    })
    .then(res => res.json())
    .then(res => {
        if (res.success) {
            alert(`Student ID ${studentId} has been timed out.`);
            document.dispatchEvent(new Event("DOMContentLoaded")); // refresh table
        } else {
            alert(`Error: ${res.message}`);
        }
    })
    .catch(err => console.error(err));
}
