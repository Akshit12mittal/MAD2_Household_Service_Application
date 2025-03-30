const AdminProfessionalsList = {
    template: `
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Professionals Management</h2>
                    <div class="d-flex">
                        <div class="input-group me-2" style="width: 300px;">
                            <input type="text" class="form-control" placeholder="Search professionals..." v-model="searchQuery" @input="filterProfessionals">
                            <button class="btn btn-outline-secondary" type="button">
                                <i class="bi bi-search"></i>
                            </button>
                        </div>
                        <select class="form-select me-2" style="width: 150px;" v-model="approvalFilter" @change="filterProfessionals">
                            <option value="">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select class="form-select" style="width: 150px;" v-model="serviceFilter" @change="filterProfessionals">
                            <option value="">All Services</option>
                            <option v-for="service in services" :key="service.id" :value="service.id">{{ service.name }}</option>
                        </select>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <div v-if="isLoading" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2">Loading professionals...</p>
                        </div>
                        
                        <div v-else-if="error" class="alert alert-danger">
                            {{ error }}
                        </div>
                        
                        <div v-else-if="filteredProfessionals.length === 0" class="text-center py-5">
                            <i class="bi bi-search" style="font-size: 3rem;"></i>
                            <p class="mt-2">No professionals found matching your criteria.</p>
                        </div>
                        
                        <div v-else class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Service</th>
                                        <th>Experience</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="professional in filteredProfessionals" :key="professional.id">
                                        <td>{{ professional.id }}</td>
                                        <td>{{ professional.name }}</td>
                                        <td>{{ professional.service_name }}</td>
                                        <td>{{ professional.experience }} years</td>
                                        <td>
                                            <span :class="getStatusBadgeClass(professional.is_approved)">
                                                {{ professional.is_approved ? 'Approved' : 'Pending' }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group">
                                                <button class="btn btn-sm btn-outline-primary" @click="viewProfessionalDetails(professional)">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <button v-if="!professional.is_approved" 
                                                        class="btn btn-sm btn-success" 
                                                        @click="approveProfessional(professional.id)">
                                                    <i class="bi bi-check-circle"></i> Approve
                                                </button>
                                                <button v-if="professional.is_approved" 
                                                        class="btn btn-sm btn-danger" 
                                                        @click="rejectProfessional(professional.id)">
                                                    <i class="bi bi-x-circle"></i> Reject
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
        
        <!-- Professional Details Modal -->
        <div class="modal fade" id="professionalDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Professional Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" v-if="selectedProfessional">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-muted mb-3">Basic Information</h6>
                                <p><strong>ID:</strong> {{ selectedProfessional.id }}</p>
                                <p><strong>Name:</strong> {{ selectedProfessional.name }}</p>
                                <p><strong>Service:</strong> {{ selectedProfessional.service_name }}</p>
                                <p><strong>Experience:</strong> {{ selectedProfessional.experience }} years</p>
                                <p>
                                    <strong>Status:</strong> 
                                    <span :class="getStatusBadgeClass(selectedProfessional.is_approved)">
                                        {{ selectedProfessional.is_approved ? 'Approved' : 'Pending' }}
                                    </span>
                                </p>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-muted mb-3">Description</h6>
                                <p>{{ selectedProfessional.description }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button v-if="selectedProfessional && !selectedProfessional.is_approved" 
                                type="button" 
                                class="btn btn-success" 
                                @click="approveProfessional(selectedProfessional.id)"
                                data-bs-dismiss="modal">
                            Approve Professional
                        </button>
                        <button v-if="selectedProfessional && selectedProfessional.is_approved" 
                                type="button" 
                                class="btn btn-danger" 
                                @click="rejectProfessional(selectedProfessional.id)"
                                data-bs-dismiss="modal">
                            Reject Professional
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            professionals: [],
            filteredProfessionals: [],
            services: [],
            selectedProfessional: null,
            isLoading: true,
            error: null,
            searchQuery: '',
            approvalFilter: '',
            serviceFilter: '',
            professionalDetailsModal: null
        }
    },
    methods: {
        fetchProfessionals: function() {
            this.isLoading = true;
            this.error = null;
            
            fetch('/api/admin/professionals', {
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
                    throw new Error('Failed to fetch professionals');
                }
                return response.json();
            })
            .then(data => {
                this.professionals = data;
                this.filteredProfessionals = [...this.professionals];
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching professionals:', error);
                this.error = error.message;
                this.isLoading = false;
            });
        },
        
        fetchServices: function() {
            fetch('/api/services', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
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
            })
            .catch(error => {
                console.error('Error fetching services:', error);
            });
        },
        
        filterProfessionals: function() {
            this.filteredProfessionals = this.professionals.filter(professional => {
                // Filter by search query
                const matchesSearch = 
                    this.searchQuery === '' || 
                    professional.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    professional.service_name.toLowerCase().includes(this.searchQuery.toLowerCase());
                
                // Filter by approval status
                const matchesApproval = 
                    this.approvalFilter === '' || 
                    (this.approvalFilter === 'approved' && professional.is_approved) || 
                    (this.approvalFilter === 'pending' && !professional.is_approved);
                
                // Filter by service
                const matchesService = 
                    this.serviceFilter === '' || 
                    professional.service_id.toString() === this.serviceFilter.toString();
                
                return matchesSearch && matchesApproval && matchesService;
            });
        },
        
        getStatusBadgeClass: function(isApproved) {
            return isApproved ? 'badge bg-success' : 'badge bg-warning text-dark';
        },
        
        viewProfessionalDetails: function(professional) {
            this.selectedProfessional = professional;
            this.professionalDetailsModal.show();
        },
        
        approveProfessional: function(professionalId) {
            if (!confirm('Are you sure you want to approve this professional?')) {
                return;
            }
            
            fetch(`/api/admin/professionals/${professionalId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to approve professional');
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                this.fetchProfessionals();
            })
            .catch(error => {
                console.error('Error approving professional:', error);
                alert('Error: ' + error.message);
            });
        },
        
        rejectProfessional: function(professionalId) {
            if (!confirm('Are you sure you want to reject this professional?')) {
                return;
            }
            
            fetch(`/api/admin/professionals/${professionalId}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to reject professional');
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                this.fetchProfessionals();
            })
            .catch(error => {
                console.error('Error rejecting professional:', error);
                alert('Error: ' + error.message);
            });
        }
    },
    mounted: function() {
        document.title = "Professionals Management - Rise Home Services";
        this.fetchProfessionals();
        this.fetchServices();
        this.professionalDetailsModal = new bootstrap.Modal(document.getElementById('professionalDetailsModal'));
    }
};
