const AboutUs = {
    template: `
    <div class="container py-5"  style="background: linear-gradient(90deg, rgba(0,145,63,0.9) 0%, rgba(200,231,23,0.7) 100%), url('https://i.postimg.cc/nVgfz6Xn/Gemini-Generated-Image-wk84svwk84svwk84.jpg') no-repeat center/cover;">
        <h1 class="text-center mb-4">About Rise Home Services</h1>
        <div class="row">
            <div class="col-md-6">
                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Home Services" class="img-fluid rounded shadow-lg mb-4">
            </div>
            <div class="col-md-6">
                <h2 class="mb-3">Our Mission</h2>
                <p>At Rise Home Services, we're committed to providing top-quality household services to make your life easier. Our platform connects skilled professionals with homeowners, ensuring a seamless experience for all your home maintenance needs.</p>
                <h2 class="mb-3 mt-4">Why Choose Us?</h2>
                <ul>
                    <li>Verified and skilled professionals</li>
                    <li>Wide range of services</li>
                    <li>Convenient booking process</li>
                    <li>Competitive pricing</li>
                    <li>Customer satisfaction guarantee</li>
                </ul>
            </div>
        </div>
        <div class="mt-5">
            <h2 class="text-center mb-4">Our Services</h2>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <i class="bi bi-tools text-primary" style="font-size: 2rem;"></i>
                            <h3 class="card-title mt-3">Plumbing</h3>
                            <p class="card-text">Expert plumbing solutions for all your needs.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <i class="bi bi-lightning-charge text-warning" style="font-size: 2rem;"></i>
                            <h3 class="card-title mt-3">Electrical</h3>
                            <p class="card-text">Professional electrical services to keep your home powered.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <i class="bi bi-house-heart text-success" style="font-size: 2rem;"></i>
                            <h3 class="card-title mt-3">Cleaning</h3>
                            <p class="card-text">Thorough cleaning services for a spotless home.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    mounted: function() {
        document.title = "About Us - Rise Home Services";
    }
};
