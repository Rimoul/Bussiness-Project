const API_URL = "http://127.0.0.1:8000";

// We store this globally so the OTP function knows whose email to verify
let pendingVerificationEmail = ""; 

async function registerUser() {
    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            // 1. Save the email to our global variable
            pendingVerificationEmail = email; 
            
            // 2. Hide the signup box and show the OTP box
            document.getElementById("register-section").style.display = "none";
            document.getElementById("otp-section").style.display = "block";
            
            alert("Account created! Check your email for the code.");
        } else {
            const errorData = await response.json();
            alert("Signup Failed: " + errorData.detail);
        }
    } catch (error) {
        console.error("Error during signup:", error);
    }
}

async function verifyOTP() {
    const otpCode = document.getElementById("otp-code").value;

    try {
        // Send both the saved email and the typed OTP to FastAPI
        const response = await fetch(`${API_URL}/verify-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: pendingVerificationEmail, 
                otp_code: otpCode 
            })
        });

        if (response.ok) {
            alert("Email verified successfully! You can now log in.");
            
            // Hide the OTP box and show the Login box
            document.getElementById("otp-section").style.display = "none";
            document.getElementById("login-section").style.display = "block";
            
            // Clear out the old form data
            document.getElementById("reg-email").value = "";
            document.getElementById("reg-password").value = "";
            document.getElementById("otp-code").value = "";
        } else {
            const errorData = await response.json();
            alert("Verification Failed: " + errorData.detail);
        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
    }
}