
// Login 
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent page reload

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        try {
            const response = await fetch("../src/php/auth/auth.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "login",
                    email: email,
                    password: password
                })
            });

            const text = await response.text();
            console.log("Raw Response:", text);

            let result;
            try {
                result = JSON.parse(text);
            } catch (err) {
                console.error("JSON Parse Error:", err);
                alert("Server returned invalid JSON. Check PHP for errors.");
                return;
            }

            console.log("Parsed Result:", result);

            if (result.status === "success") {
                alert("Login Successful!");
                // Store user data in sessionStorage (optional)
                sessionStorage.setItem("user", JSON.stringify(result.user));

                // Fixed: Updated redirect path
                window.location.href = "../src/admin/AdHome.html";
            } else {
                alert(result.message || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
});