// Signup 
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fname = document.getElementById("fname").value.trim();
        const lname = document.getElementById("lname").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        // Validate password match
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Validate password strength (optional but recommended)
        if (password.length < 8) {
            alert("Password must be at least 8 characters long!");
            return;
        }

        try {
            const response = await fetch("../php/auth/auth.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "signup",
                    fname: fname,      // Changed from first_name
                    lname: lname,      // Changed from last_name
                    email: email,
                    password: password
                })
            });

            const text = await response.text();
            console.log("Server response:", text);

            // Try to parse JSON, handle errors gracefully
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse JSON:", text);
                alert("Server error. Please check console for details.");
                return;
            }

            if (result.status === "success") {
                alert("Account Created Successfully!");
                window.location.href = "../index.html"; // Adjust path as needed
            } else {
                alert(result.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Network error. Please check your connection.");
        }
    });
});
