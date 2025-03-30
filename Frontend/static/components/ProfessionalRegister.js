const ProfessionalRegister = {
    template: `
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow" style="background: linear-gradient(90deg, #00913f 0%, #c8e717 100%);">
                    <div class="card-body p-5">
                        <h2 class="text-center text-white mb-4">Professional Registration</h2>
                        
                        <form @submit.prevent="registerProfessional">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="username" v-model="formData.username" placeholder="Username" required>
                                        <label for="username">Username</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="email" class="form-control" id="email" v-model="formData.email" placeholder="Email" required>
                                        <label for="email">Email Address</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="password" class="form-control" id="password" v-model="formData.password" placeholder="Password" required>
                                        <label for="password">Password</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="tel" class="form-control" id="phone" v-model="formData.phone" placeholder="Phone" required>
                                        <label for="phone">Phone Number</label>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="name" v-model="formData.name" placeholder="Full Name" required>
                                        <label for="name">Full Name</label>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="form-floating mb-3">
                                        <textarea class="form-control" id="description" v-model="formData.description" placeholder="Description" style="height: 100px" required></textarea>
                                        <label for="description">Professional Description</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="number" class="form-control" id="experience" v-model="formData.experience" placeholder="Experience" required>
                                        <label for="experience">Years of Experience</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <select class="form-select" id="service" v-model="formData.service_id" required>
                                            <option value="">Select a service</option>
                                            <option v-for="service in services" :key="service.id" :value="service.id">{{ service.name }}</option>
                                        </select>
                                        <label for="service">Service Type</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="d-grid mt-4">
                                <button type="submit" class="btn btn-light btn-lg" :disabled="isSubmitting">
                                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    {{ isSubmitting ? 'Registering...' : 'Register' }}
                                </button>
                            </div>
                        </form>
                        
                        <div class="text-center mt-3">
                            <p class="text-white">Already have an account? 
                                <router-link to="/login" class="text-white fw-bold">Login</router-link>
                            </p>
                            <p class="text-white">Are you a customer? 
                                <router-link to="/customer-register" class="text-white fw-bold">Register as Customer</router-link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            formData: {
                username: "",
                email: "",
                password: "",
                phone: "",
                name: "",
                description: "",
                experience: "",
                service_id: ""
            },
            services: [],
            isSubmitting: false
        }
    },
    methods: {
        registerProfessional: function() {
            this.isSubmitting = true;
            
            fetch('/api/register/professional', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.formData)
            })
            .then(response => {
                console.log("Response status:", response.status);
                return response.json();
            })
            .then(data => {
                console.log("Response data:", data);
                this.isSubmitting = false;
                
                if (data.message === "Professional registered successfully") {
                    alert("Registration successful! Please wait for admin approval.");
                    this.$router.push("/login");
                } else {
                    alert("Registration failed: " + (data.message || "Unknown error"));
                }
            })
            .catch(error => {
                console.error("Registration error:", error);
                this.isSubmitting = false;
                alert("Registration failed: " + error.message);
            });
        },
        fetchServices: function() {
            fetch('/api/services')
            .then(response => response.json())
            .then(data => {
                this.services = data;
            })
            .catch(error => {
                console.error("Error fetching services:", error);
            });
        }
    },
    mounted: function() {
        document.title = "Professional Registration - Rise Home Services";
        this.fetchServices();
    }
};
