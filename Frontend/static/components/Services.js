const Services = {
    template: `
    <div class="container py-5"  style="background: linear-gradient(90deg, rgba(0,145,63,0.9) 0%, rgba(200,231,23,0.7) 100%), url('https://i.postimg.cc/nVgfz6Xn/Gemini-Generated-Image-wk84svwk84svwk84.jpg') no-repeat center/cover;">
        <h1 class="text-center mb-4">Our Services</h1>
        
        <!-- Search Bar -->
        <div class="row justify-content-center mb-5">
            <div class="col-md-6">
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="Search services..." v-model="searchQuery" @input="filterServices">
                    <button class="btn btn-success" type="button">
                        <i class="bi bi-search"></i> Search
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Services List -->
        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading services...</p>
        </div>
        
        <div v-else-if="error" class="alert alert-danger">
            {{ error }}
        </div>
        
        <div v-else-if="filteredServices.length === 0" class="text-center py-5">
            <i class="bi bi-search" style="font-size: 3rem;"></i>
            <p class="mt-2">No services found matching your search.</p>
        </div>
        
        <div v-else class="row g-4">
            <div v-for="service in filteredServices" :key="service.id" class="col-md-4">
                <div class="card h-100 shadow">
                    <div class="card-body text-center p-4">
                        <div class="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
                            <i class="bi bi-tools" style="font-size: 2rem; color: #00913f;"></i>
                        </div>
                        <h4 class="card-title">{{ service.name }}</h4>
                        <p class="card-text text-muted">{{ service.description }}</p>
                        <p class="fw-bold text-success mb-3">₹{{ service.price }}</p>
                        <p class="text-muted mb-3"><small>Time required: {{ service.time_required }}</small></p>
                        <div v-if="isLoggedIn && isCustomer">
                            <button @click="requestService(service)" class="btn btn-success">Request Service</button>
                        </div>
                        <div v-else-if="isLoggedIn && !isCustomer">
                            <div class="alert alert-warning py-2 small">
                                Only customers can request services
                            </div>
                        </div>
                        <div v-else>
                            <router-link to="/login" class="btn btn-outline-success me-2">Login</router-link>
                            <router-link to="/customer-register" class="btn btn-outline-secondary">Register</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Request Service Modal -->
        <div class="modal fade" id="requestServiceModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Request Service</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" v-if="selectedService">
                        <form @submit.prevent="submitServiceRequest">
                            <div class="mb-3">
                                <label class="form-label">Service</label>
                                <input type="text" class="form-control" :value="selectedService.name" disabled>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Date and Time</label>
                                <input type="datetime-local" class="form-control" v-model="serviceRequest.date_of_request" required>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-success" :disabled="isSubmitting">
                                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                                    {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            services: [],
            filteredServices: [],
            searchQuery: '',
            isLoading: true,
            error: null,
            isLoggedIn: false,
            isCustomer: false,
            selectedService: null,
            serviceRequest: {
                date_of_request: ''
            },
            isSubmitting: false,
            requestServiceModal: null
        }
    },
    methods: {
        fetchServices: function() {
            this.isLoading = true;
            this.error = null;
            
            fetch('/api/services', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch services');
                }
                return response.json();
            })
            .then(data => {
                this.services = data;
                this.filteredServices = [...this.services];
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching services:', error);
                this.error = error.message;
                this.isLoading = false;
            });
        },
        
        filterServices: function() {
            if (!this.searchQuery.trim()) {
                this.filteredServices = [...this.services];
                return;
            }
            
            const query = this.searchQuery.toLowerCase().trim();
            this.filteredServices = this.services.filter(service => 
                service.name.toLowerCase().includes(query) || 
                service.description.toLowerCase().includes(query)
            );
        },
        
        checkLoginStatus: function() {
            const token = localStorage.getItem('token');
            const userRoles = localStorage.getItem('userRoles') ? JSON.parse(localStorage.getItem('userRoles')) : [];
            
            this.isLoggedIn = !!token;
            this.isCustomer = userRoles.includes('customer');
        },
        
        requestService: function(service) {
            this.selectedService = service;
            this.serviceRequest = {
                date_of_request: this.formatDateForInput(new Date())
            };
            this.requestServiceModal.show();
        },
        
        submitServiceRequest: function() {
            this.isSubmitting = true;
            
            fetch('/api/customer/service-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    service_id: this.selectedService.id,
                    date_of_request: this.serviceRequest.date_of_request
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create service request');
                }
                return response.json();
            })
            .then(data => {
                alert('Service request created successfully!');
                this.requestServiceModal.hide();
                this.isSubmitting = false;
                this.$router.push('/customer/service-requests');
            })
            .catch(error => {
                console.error('Error creating service request:', error);
                alert('Error: ' + error.message);
                this.isSubmitting = false;
            });
        },
        
        formatDateForInput: function(date) {
            const d = new Date(date);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
        }
    },
    mounted: function() {
        document.title = "Our Services - Rise Home Services";
        this.fetchServices();
        this.checkLoginStatus();
        this.requestServiceModal = new bootstrap.Modal(document.getElementById('requestServiceModal'));
    }
};
