const CustomerCreateRequest = {
    template: `
    <div class="container py-4">
        <div class="row">
            <div class="col-md-8 mx-auto">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Create Service Request</h2>
                    <router-link to="/customer/dashboard" class="btn btn-outline-secondary">
                        <i class="bi bi-arrow-left me-2"></i>Back to Dashboard
                    </router-link>
                </div>
                
                <div class="card shadow">
                    <div class="card-body p-4">
                        <div v-if="isLoading" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2">Loading services...</p>
                        </div>
                        
                        <div v-else-if="error" class="alert alert-danger">
                            {{ error }}
                        </div>
                        
                        <div v-else>
                            <form @submit.prevent="submitRequest">
                                <div class="mb-4">
                                    <label for="service" class="form-label">Select Service</label>
                                    <select class="form-select form-select-lg" id="service" v-model="requestForm.service_id" required>
                                        <option value="" disabled selected>Choose a service...</option>
                                        <option v-for="service in services" :key="service.id" :value="service.id">
                                            {{ service.name }} - ₹{{ service.price }} ({{ service.time_required }})
                                        </option>
                                    </select>
                                </div>
                                
                                <div v-if="selectedService" class="mb-4 p-3 bg-light rounded">
                                    <h5>{{ selectedService.name }}</h5>
                                    <p>{{ selectedService.description }}</p>
                                    <div class="d-flex justify-content-between">
                                        <span class="badge bg-success">₹{{ selectedService.price }}</span>
                                        <span class="badge bg-secondary">{{ selectedService.time_required }}</span>
                                    </div>
                                </div>
                                
                                <div class="mb-4">
                                    <label for="date" class="form-label">Preferred Date and Time</label>
                                    <input type="datetime-local" class="form-control form-control-lg" id="date" 
                                           v-model="requestForm.date_of_request" 
                                           :min="minDate"
                                           required>
                                    <small class="text-muted">Please select a date and time for the service</small>
                                </div>
                                
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-success btn-lg" :disabled="isSubmitting">
                                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {{ isSubmitting ? 'Submitting...' : 'Create Service Request' }}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            services: [],
            requestForm: {
                service_id: '',
                date_of_request: this.formatDateForInput(new Date(Date.now() + 24 * 60 * 60 * 1000)) // Tomorrow
            },
            isLoading: true,
            isSubmitting: false,
            error: null
        }
    },
    computed: {
        selectedService: function() {
            if (!this.requestForm.service_id) return null;
            return this.services.find(service => service.id == this.requestForm.service_id);
        },
        minDate: function() {
            // Set minimum date to today
            const today = new Date();
            return this.formatDateForInput(today);
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
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching services:', error);
                this.error = error.message;
                this.isLoading = false;
            });
        },
        
        formatDateForInput: function(date) {
            const d = new Date(date);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
        },
        
        submitRequest: function() {
            this.isSubmitting = true;
            
            fetch('/api/customer/service-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify(this.requestForm)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create service request');
                }
                return response.json();
            })
            .then(data => {
                alert('Service request created successfully!');
                this.$router.push('/customer/service-requests');
                this.isSubmitting = false;
            })
            .catch(error => {
                console.error('Error creating service request:', error);
                alert('Error: ' + error.message);
                this.isSubmitting = false;
            });
        }
    },
    mounted: function() {
        document.title = "Create Service Request - Rise Home Services";
        this.fetchServices();
    }
};
