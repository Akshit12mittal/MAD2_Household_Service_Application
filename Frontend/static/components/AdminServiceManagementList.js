const AdminServiceManagement = {
    template: `
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Services Management</h2>
                    <div class="d-flex">
                        <div class="input-group me-2" style="width: 300px;">
                            <input type="text" class="form-control" placeholder="Search services..." v-model="searchQuery" @input="filterServices">
                            <button class="btn btn-outline-secondary" type="button">
                                <i class="bi bi-search"></i>
                            </button>
                        </div>
                        <button class="btn btn-success" @click="showAddServiceModal">
                            <i class="bi bi-plus-circle me-2"></i> Add New Service
                        </button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <div v-if="isLoading" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2">Loading services...</p>
                        </div>
                        
                        <div v-else-if="error" class="alert alert-danger">
                            {{ error }}
                        </div>
                        
                        <div v-else-if="filteredServices.length === 0" class="text-center py-5">
                            <i class="bi bi-search" style="font-size: 3rem;"></i>
                            <p class="mt-2">No services found matching your criteria.</p>
                        </div>
                        
                        <div v-else class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Price (₹)</th>
                                        <th>Time Required</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="service in filteredServices" :key="service.id">
                                        <td>{{ service.id }}</td>
                                        <td>{{ service.name }}</td>
                                        <td>{{ truncateText(service.description, 50) }}</td>
                                        <td>{{ service.price }}</td>
                                        <td>{{ service.time_required }}</td>
                                        <td>
                                            <div class="btn-group">
                                                <button class="btn btn-sm btn-outline-primary" @click="viewServiceDetails(service)">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-secondary" @click="editService(service)">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger" @click="deleteService(service.id)">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Service Details Modal -->
        <div class="modal fade" id="serviceDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Service Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" v-if="selectedService">
                        <p><strong>ID:</strong> {{ selectedService.id }}</p>
                        <p><strong>Name:</strong> {{ selectedService.name }}</p>
                        <p><strong>Description:</strong> {{ selectedService.description }}</p>
                        <p><strong>Price:</strong> ₹{{ selectedService.price }}</p>
                        <p><strong>Time Required:</strong> {{ selectedService.time_required }}</p>
                        <p><strong>Date Created:</strong> {{ formatDate(selectedService.date_created) }}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="editService(selectedService)" data-bs-dismiss="modal">Edit</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Add/Edit Service Modal -->
        <div class="modal fade" id="serviceFormModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ isEditing ? 'Edit Service' : 'Add New Service' }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="saveService">
                            <div class="mb-3">
                                <label for="serviceName" class="form-label">Service Name</label>
                                <input type="text" class="form-control" id="serviceName" v-model="serviceForm.name" required>
                            </div>
                            <div class="mb-3">
                                <label for="serviceDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="serviceDescription" v-model="serviceForm.description" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="servicePrice" class="form-label">Price (₹)</label>
                                <input type="number" class="form-control" id="servicePrice" v-model="serviceForm.price" required>
                            </div>
                            <div class="mb-3">
                                <label for="serviceTimeRequired" class="form-label">Time Required</label>
                                <input type="text" class="form-control" id="serviceTimeRequired" v-model="serviceForm.time_required" placeholder="e.g. 2 hours" required>
                            </div>
                            <div class="d-flex justify-content-end">
                                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary">{{ isEditing ? 'Update' : 'Create' }}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Delete Confirmation Modal -->
        <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Delete</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete this service? This action cannot be undone.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" @click="confirmDelete" data-bs-dismiss="modal">Delete</button>
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
            selectedService: null,
            serviceToDelete: null,
            isLoading: true,
            error: null,
            searchQuery: '',
            isEditing: false,
            serviceForm: {
                name: '',
                description: '',
                price: '',
                time_required: ''
            },
            serviceDetailsModal: null,
            serviceFormModal: null,
            deleteConfirmModal: null
        }
    },
    methods: {
        fetchServices: function() {
            this.isLoading = true;
            this.error = null;
            
            fetch('/api/services', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('token');
                        this.$router.push('/login');
                        throw new Error('Unauthorized access. Please login again.');
                    }
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
            this.filteredServices = this.services.filter(service => {
                return service.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                       service.description.toLowerCase().includes(this.searchQuery.toLowerCase());
            });
        },
        
        truncateText: function(text, length) {
            if (text.length <= length) return text;
            return text.substring(0, length) + '...';
        },
        
        formatDate: function(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        viewServiceDetails: function(service) {
            this.selectedService = service;
            this.serviceDetailsModal.show();
        },
        
        showAddServiceModal: function() {
            this.isEditing = false;
            this.serviceForm = {
                name: '',
                description: '',
                price: '',
                time_required: ''
            };
            this.serviceFormModal.show();
        },
        
        editService: function(service) {
            this.isEditing = true;
            this.serviceForm = {
                id: service.id,
                name: service.name,
                description: service.description,
                price: service.price,
                time_required: service.time_required
            };
            this.serviceFormModal.show();
        },
        
        saveService: function() {
            const url = this.isEditing ? `/api/services/${this.serviceForm.id}` : '/api/service';
            const method = this.isEditing ? 'PUT' : 'POST';
            
            fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify(this.serviceForm)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(this.isEditing ? 'Failed to update service' : 'Failed to create service');
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                this.serviceFormModal.hide();
                this.fetchServices();
            })
            .catch(error => {
                console.error('Error saving service:', error);
                alert('Error: ' + error.message);
            });
        },
        
        deleteService: function(serviceId) {
            this.serviceToDelete = serviceId;
            this.deleteConfirmModal.show();
        },
        
        confirmDelete: function() {
            if (!this.serviceToDelete) return;
            
            fetch(`/api/services/${this.serviceToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete service');
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                this.fetchServices();
            })
            .catch(error => {
                console.error('Error deleting service:', error);
                alert('Error: ' + error.message);
            });
        }
    },
    mounted: function() {
        document.title = "Services Management - Rise Home Services";
        this.fetchServices();
        this.serviceDetailsModal = new bootstrap.Modal(document.getElementById('serviceDetailsModal'));
        this.serviceFormModal = new bootstrap.Modal(document.getElementById('serviceFormModal'));
        this.deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    }
};