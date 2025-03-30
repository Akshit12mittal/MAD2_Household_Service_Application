const Footer = {
    template: `
    <footer class="py-5 mt-5" style="background: linear-gradient(90deg, #00913f 0%,rgb(0, 0, 0) 100%);">
        <div class="container">
            <div class="row text-white">
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">Rise Home Services</h5>
                    <p class="mb-3">Your trusted partner for professional household services. Quality work guaranteed.</p>
                    <div class="d-flex gap-3 mb-3">
                        <a href="#" class="text-white"><i class="bi bi-facebook fs-5"></i></a>
                        <a href="#" class="text-white"><i class="bi bi-twitter fs-5"></i></a>
                        <a href="#" class="text-white"><i class="bi bi-instagram fs-5"></i></a>
                        <a href="#" class="text-white"><i class="bi bi-linkedin fs-5"></i></a>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">Quick Links</h5>
                    <ul class="list-unstyled">
                        <li class="mb-2"><router-link to="/" class="text-white text-decoration-none">Home</router-link></li>
                        <li class="mb-2"><router-link to="/login" class="text-white text-decoration-none">Login</router-link></li>
                    </ul>
                </div>
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">Contact Us</h5>
                    <p class="mb-2"><i class="bi bi-geo-alt me-2"></i>Akshit Mittal</p>
                    <p class="mb-2"><i class="bi bi-telephone me-2"></i>+91 8837840881</p>
                    <p class="mb-2"><i class="bi bi-envelope me-2"></i>akshit12mittal@gmail.com</p>
                </div>
            </div>
            <hr class="border-light">
            <div class="row">
                <div class="col-md-6 text-white">
                    <p class="mb-0">&copy; 2025 Rise Home Services. All rights reserved.</p>
                </div>
                <div class="col-md-6 text-end">
                    <ul class="list-inline mb-0">
                        <li class="list-inline-item"><a href="#" class="text-white text-decoration-none small">Privacy Policy</a></li>
                        <li class="list-inline-item"><a href="#" class="text-white text-decoration-none small">Terms of Service</a></li>
                        <li class="list-inline-item"><a href="#" class="text-white text-decoration-none small">Cookie Policy</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
    `
};
