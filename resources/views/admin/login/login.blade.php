<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VMH GROUP'S | Login</title>

    <link href="{{ asset('assets') }}/login-assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

<style>

/* ===== GLOBAL LIGHT BG ===== */
body {
    font-family: 'Inter', sans-serif !important;
    background: #F8FAFC !important;
    min-height: 100vh;
    color: #0F172A !important;
    overflow-x: hidden;
}

/* ===== SOFT BLOBS ===== */
body::before,
body::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    animation: moveBlob 12s infinite alternate ease-in-out;
    z-index: 0;
}

body::before {
    width: 400px;
    height: 400px;
    background: rgba(79,70,229,0.15);
    top: -120px;
    left: -120px;
}

body::after {
    width: 350px;
    height: 350px;
    background: rgba(6,182,212,0.15);
    bottom: -120px;
    right: -120px;
}

@keyframes moveBlob {
    from { transform: translate(0,0); }
    to { transform: translate(40px,30px); }
}

/* ===== LAYOUT ===== */
.login-container {
    min-height: 100vh;
    position: relative;
    z-index: 1;
}

/* ===== LEFT PANEL ===== */
.side-panel {
    padding: 80px;
}

.side-panel h1 {
    font-size: 40px;
    font-weight: 600;
    color: #0F172A;
}

.side-panel p {
    margin-top: 15px;
    font-size: 15px;
    color: #64748B;
}

/* ===== CARD ===== */
.login-card {
    background: #FFFFFF !important;
    border-radius: 16px;
    padding: 40px;
    border: 1px solid #E5E7EB;
    box-shadow: 0 15px 40px rgba(0,0,0,0.06);
    transition: 0.3s;
    animation: fadeUp 0.6s ease;
    width: 100%;
}

.login-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 25px 50px rgba(0,0,0,0.08);
}

/* ===== ANIMATION ===== */
@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ===== TEXT ===== */
.logo-text {
    font-weight: 600;
    font-size: 24px;
    color: #0F172A;
}

.text-muted {
    color: #64748B !important;
}

.form-label {
    font-size: 13px;
    font-weight: 500;
    color: #334155;
}

/* ===== INPUT ===== */
.form-control {
    background: #F9FAFB !important;
    border: 1px solid #E5E7EB !important;
    border-radius: 8px;
    height: 46px;
    font-size: 14px;
    color: #0F172A !important;
    transition: all 0.25s ease;
}

.form-control::placeholder {
    color: #94A3B8;
}

.form-control:focus {
    border-color: #4F46E5 !important;
    box-shadow: 0 0 0 2px rgba(79,70,229,0.15);
    background: #FFFFFF !important;
}

/* ===== INPUT ICON ===== */
.input-group-text {
    background: #F1F5F9 !important;
    border: 1px solid #E5E7EB !important;
    border-right: none;
    color: #64748B;
}

.input-group:focus-within .input-group-text {
    border-color: #4F46E5;
    color: #4F46E5;
}

/* ===== BUTTON ===== */
.btn-primary {
    background: #4F46E5 !important;
    border: none;
    border-radius: 8px;
    height: 46px;
    font-weight: 500;
    transition: 0.3s;
    position: relative;
    overflow: hidden;
}

.btn-primary:hover {
    background: #4338CA !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(79,70,229,0.25);
}

.btn-primary::after {
    content: "";
    position: absolute;
    width: 120%;
    height: 100%;
    background: rgba(255,255,255,0.2);
    top: 0;
    left: -120%;
    transition: 0.5s;
}

.btn-primary:hover::after {
    left: 0;
}

/* ===== ALERT ===== */
.error-text {
    color: #DC2626;
    font-size: 14px;
    text-align: center;
}

.text-logout {
    color: #16A34A;
    font-size: 14px;
    text-align: center;
}

/* ===== RESPONSIVE ===== */
@media(max-width: 991px){
    body {
        overflow: auto;
    }

    .side-panel {
        display: none;
    }

    .login-card {
        margin: 20px;
        padding: 30px;
    }
}

@media(max-width: 576px){
    .login-card {
        padding: 25px;
    }

    .logo-text {
        font-size: 20px;
    }
}

</style>
</head>

<body>

<div class="container-fluid login-container">
    <div class="row h-100">

        <!-- LEFT PANEL -->
        <div class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center side-panel">
            <div>
                <h1>VMH GROUP</h1>
                <p>
                    Smart dashboard for managing vendors, leads, and projects with performance-driven insights.
                </p>
            </div>
        </div>

        <!-- LOGIN -->
        <div class="col-lg-6 d-flex align-items-center justify-content-center">
            <div class="login-card w-100" style="max-width: 380px;">

                <div class="text-center mb-4">
                    <div class="logo-text">Welcome Back 👋</div>
                    <p class="text-muted">Login to your dashboard</p>
                </div>

                <div class="error-text">
                    @if (session()->has('error'))
                        {{ session('error') }}
                    @endif
                </div>

                <div class="text-logout">
                    @if (session()->has('logout'))
                        {{ session('logout') }}
                    @endif
                </div>

                <form method="post" action="{{ route('admin.auth') }}">
                    @csrf

                    <div class="mb-3">
                        <label class="form-label">Username</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-person"></i></span>
                            <input type="text" name="username" class="form-control" placeholder="Enter username">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Password</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-lock"></i></span>
                            <input type="password" name="password" class="form-control" placeholder="Enter password">
                        </div>
                    </div>

                    <div class="d-grid mt-4">
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-box-arrow-in-right"></i> Login
                        </button>
                    </div>

                </form>

            </div>
        </div>

    </div>
</div>

<script src="{{ asset('assets') }}/login-assets/js/bootstrap.bundle.min.js"></script>

</body>
</html>