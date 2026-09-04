<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My E-Commerce Store - Authentication</title>
    <!-- Official Google Identity Services Script -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <style>
        /* CSS Reset & Variables */
        :root {
            --bg-body: #f3f4f6;
            --bg-panel: #ffffff;
            --text-main: #111827;
            --text-muted: #6b7280;
            --accent: #ff9e00;
            --accent-hover: #e68e00;
            --border: #e5e7eb;
            --input-bg: #f9fafb;
            --error-red: #ef4444;
            --header-bg: #ffffff;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-body);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* --- Header Styles --- */
        header {
            background-color: var(--header-bg);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        header h1 {
            font-size: 1.5rem;
            color: var(--text-main);
            margin: 0;
        }

        .header-controls {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        #cart-info {
            font-weight: 500;
            color: var(--text-muted);
        }

        .profile-menu {
            position: relative;
        }

        .profile-icon {
            width: 35px;
            height: 35px;
            background-color: var(--accent);
            color: #000;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: bold;
            cursor: pointer;
            user-select: none;
        }

        .dropdown-content {
            display: none;
            position: absolute;
            right: 0;
            top: 45px;
            background-color: white;
            min-width: 150px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            border-radius: 6px;
            border: 1px solid var(--border);
            overflow: hidden;
            z-index: 100;
        }

        .dropdown-content.show {
            display: block;
        }

        .dropdown-content a {
            color: var(--text-main);
            padding: 12px 16px;
            text-decoration: none;
            display: block;
            font-size: 0.9rem;
        }

        .dropdown-content a:hover {
            background-color: var(--input-bg);
        }

        /* --- Main Authentication Layout --- */
        main {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 3rem 1rem;
        }

        .auth-container {
            display: flex;
            flex-direction: row;
            gap: 2rem;
            max-width: 1000px;
            width: 100%;
        }

        @media (max-width: 768px) {
            .auth-container {
                flex-direction: column;
            }
        }

        /* --- Panel Styles --- */
        .auth-panel {
            background-color: var(--bg-panel);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 2.5rem;
            flex: 1;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .auth-panel h2 {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            color: var(--text-main);
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
            font-weight: 600;
        }

        .req {
            color: var(--error-red);
        }

        .form-control {
            width: 100%;
            padding: 0.75rem 1rem;
            background-color: var(--input-bg);
            border: 1px solid var(--border);
            border-radius: 6px;
            color: var(--text-main);
            font-size: 1rem;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 3px rgba(255, 158, 0, 0.1);
        }

        .info-box {
            background-color: #fcfdfd;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .info-box p {
            font-size: 0.85rem;
            color: var(--text-muted);
            line-height: 1.5;
            margin-bottom: 1rem;
        }

        .info-box p:last-child {
            margin-bottom: 0;
        }

        .info-box a {
            color: var(--accent);
            text-decoration: none;
            font-weight: 500;
        }

        /* Buttons */
        .btn {
            display: inline-block;
            width: 100%;
            padding: 0.875rem 1.5rem;
            font-size: 0.9rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #000;
            background-color: var(--accent);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            text-align: center;
            transition: background-color 0.2s;
        }

        .btn:hover {
            background-color: var(--accent-hover);
        }

        .btn:disabled {
            background-color: #cbd5e1;
            cursor: not-allowed;
            color: #64748b;
        }

        .btn-secondary {
            background-color: #e5e7eb;
            color: var(--text-main);
        }

        .btn-secondary:hover {
            background-color: #d1d5db;
        }

        .divider {
            display: flex;
            align-items: center;
            text-align: center;
            margin: 1.5rem 0;
            color: var(--text-muted);
            font-size: 0.875rem;
        }

        .divider::before,
        .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid var(--border);
        }

        .divider:not(:empty)::before {
            margin-right: .5em;
        }

        .divider:not(:empty)::after {
            margin-left: .5em;
        }

        .google-btn-wrapper {
            display: flex;
            justify-content: center;
            width: 100%;
        }

        /* Timer badge */
        #resend-timer-display {
            display: inline-block;
            margin-left: 10px;
            font-size: 0.8rem;
            color: var(--error-red);
            font-weight: bold;
        }

    </style>
</head>
<body>
    
    <!-- GOOGLE ONLOAD INITIALIZATION (Hidden data component) -->
    <div id="g_id_onload"
         data-client_id="837375612904-t6bbgp46169t7qfvn5ho9kehrc6eldb2.apps.googleusercontent.com"
         data-context="signin"
         data-ux_mode="popup"
         data-callback="handleGoogleLogin"
         data-auto_prompt="false">
    </div>

    <header>
        <h1>My Awesome Store</h1>
        
        <div class="header-controls">
            <div id="cart-info">Cart: 0 items</div>
            
            <div class="profile-menu">
                <div class="profile-icon" id="profile-icon" onclick="toggleDropdown()">?</div>
                <div id="profile-dropdown" class="dropdown-content">
                    <a href="#view-profile">View Profile</a>
                    <a href="#edit-profile">Edit Profile</a>
                    <a href="#" onclick="logoutUser()" style="color: #d9534f;">Sign Out</a>
                </div>
            </div>
        </div>
    </header>

    <main>
        <div class="auth-container">
            <!-- LOGIN PANEL -->
            <div class="auth-panel" id="login-section">
                <h2>Login</h2>
                
                <div class="form-group">
                    <label for="login-email">Username or Email Address <span class="req">*</span></label>
                    <input type="text" id="login-email" class="form-control" placeholder="Enter your email or username">
                </div>

                <div class="form-group">
                    <label for="login-password">Password <span class="req">*</span></label>
                    <input type="password" id="login-password" class="form-control" placeholder="Enter your password">
                </div>

                <div class="info-box">
                    <p>Enter your credentials above to access your account. Ensure your password is kept secure.</p>
                </div>

                <button class="btn" onclick="loginUser()">Login</button>
                
                <div class="divider">OR</div>
                
                <!-- THE GOOGLE BUTTON FOR LOGIN -->
                <div class="google-btn-wrapper">
                    <div class="g_id_signin"
                         data-type="standard"
                         data-shape="rectangular"
                         data-theme="outline"
                         data-text="signin_with"
                         data-size="large"
                         data-logo_alignment="left">
                    </div>
                </div>
            </div>

            <!-- REGISTER & OTP PANELS (Right Side) -->
            <div class="auth-panel" style="position: relative;">
                
                <!-- Registration Form -->
                <div id="register-section">
                    <h2>Register</h2>
                    
                    <div class="form-group">
                        <label for="reg-username">Username <span class="req">*</span></label>
                        <input type="text" id="reg-username" class="form-control" placeholder="Choose a username">
                    </div>

                    <div class="form-group">
                        <label for="reg-email">Email Address <span class="req">*</span></label>
                        <input type="email" id="reg-email" class="form-control" placeholder="Enter your email address">
                    </div>

                    <div class="form-group">
                        <label for="reg-password">Password <span class="req">*</span></label>
                        <input type="password" id="reg-password" class="form-control" placeholder="Create a strong password">
                    </div>

                    <div class="info-box">
                        <p>Your personal data will be used to support your experience throughout this website, to manage access to your account.</p>
                        <p>Enter your details above, then we'll verify your email with an OTP.</p>
                    </div>

                    <button class="btn" onclick="registerUser()">Sign Up</button>
                    
                    <div class="divider">OR</div>
                    
                    <!-- THE GOOGLE BUTTON FOR REGISTRATION -->
                    <div class="google-btn-wrapper">
                        <div class="g_id_signin"
                             data-type="standard"
                             data-shape="rectangular"
                             data-theme="outline"
                             data-text="signup_with"
                             data-size="large"
                             data-logo_alignment="left">
                        </div>
                    </div>
                </div>

                <!-- OTP Verification Form (Hidden by default) -->
                <div id="otp-section" style="display: none;">
                    <h2>Verify Your Email</h2>
                    
                    <div class="form-group">
                        <label for="otp-code">Enter OTP Code <span class="req">*</span></label>
                        <input type="text" id="otp-code" class="form-control" placeholder="6-digit code from your email">
                    </div>

                    <div class="info-box">
                        <p>We just sent a 6-digit code to your email. It expires in 10 minutes.</p>
                    </div>

                    <button class="btn" onclick="verifyOTP()" style="margin-bottom: 1rem;">Verify Account</button>
                    
                    <div style="display: flex; align-items: center; justify-content: center; margin-top: 10px;">
                        <button id="resend-btn" class="btn btn-secondary" onclick="resendOTP()" style="width: auto; padding: 0.5rem 1rem;" disabled>Resend OTP</button>
                        <span id="resend-timer-display" style="display: none;">01:00</span>
                    </div>
                </div>

            </div>
        </div>
    </main>

    <!-- App Logic Script -->
    <script>
        // --- UI Interactions ---
        function toggleDropdown() {
            document.getElementById("profile-dropdown").classList.toggle("show");
        }

        // Close dropdown if clicked outside
        window.onclick = function(event) {
            if (!event.target.matches('.profile-icon')) {
                var dropdowns = document.getElementsByClassName("dropdown-content");
                for (var i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
        }


        // --- AUTH GUARD & BACKEND LOGIC ---
        const API_URL = "http://127.0.0.1:8000";

        // If the user has a session and is on the login page, bounce them to the dashboard
        if (localStorage.getItem("user_id")) {
            if (window.location.pathname.endsWith("log.html") || window.location.pathname === "/") {
                window.location.href = "index.html"; 
            }
        }

        let pendingVerificationEmail = ""; 
        
        let resendTimer = null;
        const RESEND_COOLDOWN = 60;

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
                    
                    startResendCooldown();
                    alert("Account created! Check your email for the code.");
                } else {
                    const errorData = await response.json();
                    alert("Signup Failed: " + errorData.detail);
                }
            } catch (error) {
                console.error("Error during signup:", error);
                alert("Network error: Could not reach the server.");
            }
        }

        async function resendOTP() {
            if (!pendingVerificationEmail) return;
            
            document.getElementById("resend-btn").disabled = true;
            
            try {
                const response = await fetch(`${API_URL}/resend-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: pendingVerificationEmail })
                });
                
                if (response.ok) {
                    startResendCooldown();
                } else {
                    const errorData = await response.json();
                    alert("Failed to resend: " + errorData.detail);
                    document.getElementById("resend-btn").disabled = false;
                }
            } catch (error) {
                console.error("Error resending:", error);
                alert("Network error: Could not reach the server.");
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
                    // FIX: We must await and parse the JSON before accessing data.user_id
                    const data = await response.json(); 
                    
                    // Auto-login by saving the returned data to localStorage
                    localStorage.setItem("user_id", data.user_id);
                    localStorage.setItem("username", data.username);
                    
                    clearInterval(resendTimer); 
                    alert("Email verified successfully! Logging you in...");
                    window.location.href = "index.html"; 
                    
                } else {
                    const errorData = await response.json();
                    alert("Verification Failed: " + errorData.detail);
                }
            } catch (error) {
                console.error("Error during OTP verification:", error);
                alert("Network error: Could not reach the server.");
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
                    // Save identity to local storage
                    localStorage.setItem("user_id", data.user_id);
                    localStorage.setItem("username", data.username);

                    alert(`Welcome, ${data.username}!`);
                    window.location.href = "index.html"; // Redirect to dashboard
                } else {
                    alert("Google Login Failed: " + data.detail);
                }
            } catch (error) {
                console.error("Error during Google Login:", error);
                alert("Network error: Could not reach the server.");
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
                alert("Network error: Could not reach the server.");
            }
        }

        function logoutUser() {
            localStorage.removeItem("user_id");
            localStorage.removeItem("username");
            window.location.href = "log.html";
        }
    </script>
</body>
</html>