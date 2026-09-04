const API_URL = "http://127.0.0.1:8000";

// --- AUTH GUARD ---
// If the user has a session and is on the login page, bounce them to the dashboard
if (localStorage.getItem("user_id")) {
    if (window.location.pathname.endsWith("log.html") || window.location.pathname === "/") {
        window.location.href = "index.html";
    }
}

let pendingVerificationEmail = ""; 
// 1. ADD THE TIMER VARIABLES
let resendTimer = null;
const RESEND_COOLDOWN = 60;

// 2. ADD THE TIMER FUNCTION
function startResendCooldown() {
    const resendBtn = document.getElementById("resend-btn");
    const timerDisplay = document.getElementById("resend-timer-display");
    let timeLeft = RESEND_COOLDOWN;

    resendBtn.disabled = true;
    timerDisplay.style.display = "inline";
    timerDisplay.innerText = "01:00";

    clearInterval(resendTimer);
    resendTimer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const seconds = (timeLeft % 60).toString().padStart(2, '0');
        timerDisplay.innerText = `${minutes}:${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(resendTimer);
            resendBtn.disabled = false;
            timerDisplay.style.display = "none";
        }
    }, 1000);
}

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
            pendingVerificationEmail = email; 
            
            document.getElementById("register-section").style.display = "none";
            document.getElementById("otp-section").style.display = "block";
            
            // 3. TRIGGER THE TIMER HERE
            startResendCooldown();
            
            alert("Account created! Check your email for the code.");
        } else {
            const errorData = await response.json();
            alert("Signup Failed: " + errorData.detail);
        }
    } catch (error) {
        console.error("Error during signup:", error);
    }
}

// 4. ADD THE RESEND NETWORK CALL
async function resendOTP() {
    if (!pendingVerificationEmail) return;
    
    // Optional: Instantly disable the button the moment they click to prevent double-clicks 
    // while waiting for the server to respond.
    document.getElementById("resend-btn").disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/resend-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: pendingVerificationEmail })
        });
        
        if (response.ok) {
            // Success: No alert. The timer starts and keeps the button locked.
            startResendCooldown();
        } else {
            // We only alert if something actually goes wrong
            const errorData = await response.json();
            alert("Failed to resend: " + errorData.detail);
            document.getElementById("resend-btn").disabled = false;
        }
    } catch (error) {
        console.error("Error resending:", error);
        document.getElementById("resend-btn").disabled = false;
    }
}

async function verifyOTP() {
    const otpCode = document.getElementById("otp-code").value;

    try {
        const response = await fetch(`${API_URL}/verify-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: pendingVerificationEmail, 
                otp_code: otpCode 
            })
        });

        if (response.ok) {
            
            // Auto-login by saving the returned data to localStorage
            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("username", data.username);
            
            clearInterval(resendTimer); // Stop timer on success
            alert("Email verified successfully! Logging you in...");
            window.location.href = "index.html"; 
            
            document.getElementById("otp-section").style.display = "none";
            document.getElementById("login-section").style.display = "block";
            
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

async function handleGoogleLogin(response) {
    // Google gives us a 'credential' string (the JWT token)
    const googleToken = response.credential;

    try {
        const res = await fetch(`${API_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: googleToken })
        });

        const data = await res.json();

        if (res.ok) {
            // ---> NEW LINES: Save identity to local storage <---
            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("username", data.username);

            alert(`Welcome, ${data.username}!`);
            window.location.href = "index.html"; // Redirect to dashboard
        } else {
            alert("Google Login Failed: " + data.detail);
        }
    } catch (error) {
        console.error("Error during Google Login:", error);
    }
}


async function loginUser() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            
            // Save identity to local storage
            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("username", data.username);
            
            alert("Login successful! Welcome " + data.username);
            window.location.href = "index.html";
        } else {
            const errorData = await response.json();
            alert("Login Failed: " + errorData.detail);
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
}

function logoutUser() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    window.location.href = "log.html";
}