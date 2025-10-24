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
            const response = await fetch("php/login_and_signup.php", {
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
                alert("Server returned invalid JSON. Check PHP for errors.");
                return;
            }

            console.log(result);

            if (result.status === "success") {
                alert("Login Successful!");
                window.location.href = "AdHome.html"; // ✅ Redirect to dashboard
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
});
