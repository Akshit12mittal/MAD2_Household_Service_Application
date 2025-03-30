const Home = {
    template: `
    <div class="container-fluid py-5">
    <div >
        <!-- Hero Section -->
            <div class="container py-5">
                <div class="row align-items-center">
                    <div class="col-lg-6 text-white">
                        <h1 class="display-4 fw-bold mb-4">Professional Home Services at Your Doorstep</h1>
                        <p class="lead mb-4">From plumbing and electrical work to cleaning and home repairs, we've got all your household needs covered.</p>
                        <div class="d-flex gap-3">
                            <router-link to="/customer-register" class="btn btn-outline-light btn-lg px-4">Sign Up Now</router-link>
                        </div>
                    </div>
                    <div class="col-lg-6 d-none d-lg-block">
                        <img src="https://i.postimg.cc/nVgfz6Xn/Gemini-Generated-Image-wk84svwk84svwk84.jpg" alt="Home Services" class="img-fluid rounded shadow-lg">
                    </div>
                </div>
            </div>
        </div>
        <!-- Featured Services -->
        <div class="container py-5">
            <h2 class="text-center mb-5">Our Featured Services</h2>
            <div class="row g-4">
                <div v-for="service in featuredServices" :key="service.id" class="col-md-4">
                    <div class="card h-100 shadow-sm border-0 hover-scale">
                        <div class="card-body text-center p-4">
                            <div class="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
                                <i :class="service.icon" style="font-size: 2rem; color: #00913f;"></i>
                            </div>
                            <h4 class="card-title">{{ service.name }}</h4>
                            <p class="card-text text-muted">{{ service.description }}</p>
                            <p class="fw-bold text-success mb-3">Starting from ₹{{ service.price }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- How It Works Section -->   
        <div class="container-fluid py-5 bg-light">
            <div class="container">
                <h2 class="text-center mb-5">How It Works</h2>
                <div class="row g-4">
                    <div class="col-md-3">
                        <div class="text-center">
                            <div class="rounded-circle bg-success d-inline-flex align-items-center justify-content-center mb-3" style="width: 70px; height: 70px;">
                                <h3 class="text-white m-0">1</h3>
                            </div>
                            <h4>Choose a Service</h4>
                            <p class="text-muted">Browse through our wide range of professional services</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <div class="rounded-circle bg-success d-inline-flex align-items-center justify-content-center mb-3" style="width: 70px; height: 70px;">
                                <h3 class="text-white m-0">2</h3>
                            </div>
                            <h4>Book an Appointment</h4>
                            <p class="text-muted">Select your preferred date and time</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <div class="rounded-circle bg-success d-inline-flex align-items-center justify-content-center mb-3" style="width: 70px; height: 70px;">
                                <h3 class="text-white m-0">3</h3>
                            </div>
                            <h4>Get Confirmed</h4>
                            <p class="text-muted">A professional will be assigned to your request</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <div class="rounded-circle bg-success d-inline-flex align-items-center justify-content-center mb-3" style="width: 70px; height: 70px;">
                                <h3 class="text-white m-0">4</h3>
                            </div>
                            <h4>Service Delivered</h4>
                            <p class="text-muted">Sit back as we deliver quality service</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Testimonials Section -->
        <div class="container py-5">
            <h2 class="text-center mb-5">What Our Customers Say</h2>
            <div class="row g-4">
                <div v-for="testimonial in testimonials" :key="testimonial.id" class="col-md-4">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="card-body p-4">
                            <div class="d-flex mb-3">
                                <div v-for="n in 5" :key="n" class="me-1">
                                    <i class="bi" :class="n <= testimonial.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'"></i>
                                </div>
                            </div>
                            <p class="card-text mb-3">"{{ testimonial.comment }}"</p>
                            <div class="d-flex align-items-center">
                                <div class="rounded-circle bg-light d-inline-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px;">
                                    <i class="bi bi-person-circle fs-3 text-secondary"></i>
                                </div>
                                <div>
                                    <h6 class="mb-0">{{ testimonial.name }}</h6>
                                    <small class="text-muted">{{ testimonial.service }}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CTA Section -->
        <div class="container-fluid py-5" style="background: linear-gradient(90deg, #00913f 0%, #c8e717 100%);">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-8 text-white">
                        <h2 class="mb-3">Ready to get started?</h2>
                        <p class="lead mb-0">Join thousands of satisfied customers who trust our services every day.</p>
                    </div>
                    <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
                        <router-link to="/customer-register" class="btn btn-light btn-lg me-2">Sign Up Now</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            featuredServices: [
                {
                    id: 1,
                    name: "Plumbing Services",
                    description: "Professional plumbing solutions for leaks, installations, and repairs.",
                    price: 499,
                    icon: "bi bi-tools"
                },
                {
                    id: 2,
                    name: "Electrical Work",
                    description: "Safe and reliable electrical repairs, installations, and maintenance.",
                    price: 599,
                    icon: "bi bi-lightning-charge"
                },
                {
                    id: 3,
                    name: "Home Cleaning",
                    description: "Thorough cleaning services to keep your home spotless and fresh.",
                    price: 799,
                    icon: "bi bi-house-heart"
                }
            ],
            testimonials: [
                {
                    id: 1,
                    name: "Rahul Sharma",
                    service: "Plumbing Services",
                    rating: 5,
                    comment: "Excellent service! The plumber was professional, on time, and fixed my issue quickly."
                },
                {
                    id: 2,
                    name: "Priya Patel",
                    service: "Home Cleaning",
                    rating: 4,
                    comment: "Very satisfied with the cleaning service. My home looks and smells amazing now."
                },
                {
                    id: 3,
                    name: "Amit Singh",
                    service: "Electrical Work",
                    rating: 5,
                    comment: "Prompt service and excellent work. The electrician was knowledgeable and efficient."
                }
            ]
        }
    },
    mounted: function() {
        document.title = "Rise Home Services - Professional Home Services at Your Doorstep";
    }
};
