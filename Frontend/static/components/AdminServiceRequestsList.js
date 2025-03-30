const AdminServiceRequestsList = {
    template: `
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Service Requests Management</h2>
                    <div class="d-flex">
                        <div class="input-group me-2" style="width: 250px;">
                            <input type="text" class="form-control" placeholder="Search..." v-model="searchQuery" @input="filterRequests">
                            <button class="btn btn-outline-secondary" type="button">
                                <i class="bi bi-search"></i>
                            </button>
                        </div>
                        <select class="form-select me-2" style="width: 150px;" v-model="statusFilter" @change="filterRequests">
                            <option value="">All Status</option>
                            <option value="requested">Requested</option>
                            <option value="assigned">Assigned</option>
                            <option value="closed">Closed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <div v-if="isLoading" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2">Loading service requests...</p>
                        </div>
                        
                        <div v-else-if="error" class="alert alert-danger">
                            {{ error }}
                        </div>
                        
                        <div v-else-if="filteredRequests.length === 0" class="text-center py-5">
                            <i class="bi bi-search" style="font-size: 3rem;"></i>
                            <p class="mt-2">No service requests found matching your criteria.</p>
                        </div>
                        
                        <div v-else class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Service</th>
                                        <th>Customer</th>
                                        <th>Professional</th>
                                        <th>Request Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="request in filteredRequests" :key="request.id">
                                        <td>{{ request.id }}</td>
                                        <td>{{ request.service_name }}</td>
                                        <td>{{ request.customer_name }}</td>
                                        <td>{{ request.professional_name || 'Not Assigned' }}</td>
                                        <td>{{ formatDate(request.date_of_request) }}</td>
                                        <td>
                                            <span :class="getStatusBadgeClass(request.status)">
                                                {{ request.status }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group">
                                                <button class="btn btn-sm btn-outline-primary" @click="viewRequestDetails(request)">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger" @click="deleteRequest(request.id)">
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

        <div class="modal fade" id="requestDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Service Request Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" v-if="selectedRequest">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-muted mb-3">Request Information</h6>
                                <p><strong>ID:</strong> {{ selectedRequest.id }}</p>
                                <p><strong>Service:</strong> {{ selectedRequest.service_name }}</p>
                                <p><strong>Status:</strong> 
                                    <span :class="getStatusBadgeClass(selectedRequest.status)">
                                        {{ selectedRequest.status }}
                                    </span>
                                </p>
                                <p><strong>Request Date:</strong> {{ formatDate(selectedRequest.date_of_request) }}</p>
                                <p v-if="selectedRequest.date_of_completion">
                                    <strong>Completion Date:</strong> {{ formatDate(selectedRequest.date_of_completion) }}
                                </p>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-muted mb-3">People Involved</h6>
                                <p><strong>Customer:</strong> {{ selectedRequest.customer_name }}</p>
                                <p><strong>Professional:</strong> {{ selectedRequest.professional_name || 'Not Assigned' }}</p>
                            </div>
                        </div>
                        
                        <div class="mt-4" v-if="selectedRequest.remarks">
                            <h6 class="text-muted mb-3">Remarks</h6>
                            <div class="card bg-light">
                                <div class="card-body">
                                    {{ selectedRequest.remarks }}
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-4" v-if="selectedRequest.review">
                            <h6 class="text-muted mb-3">Customer Review</h6>
                            <div class="card bg-light">
                                <div class="card-body">
                                    <div class="d-flex mb-2">
                                        <div v-for="n in 5" :key="n" class="me-1">
                                            <i class="bi" :class="n <= selectedRequest.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'"></i>
                                        </div>
                                    </div>
                                    <p class="mb-0">{{ selectedRequest.review }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-danger" @click="deleteRequest(selectedRequest.id)" data-bs-dismiss="modal">
                            Delete Request
                        </button>
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
                        <p>Are you sure you want to delete this service request? This action cannot be undone.</p>
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
            requests: [],
            filteredRequests: [],
            selectedRequest: null,
            requestToDelete: null,
            isLoading: true,
            error: null,
            searchQuery: '',
            statusFilter: '',
            requestDetailsModal: null,
            deleteConfirmModal: null
        }
    },
    methods: {
        fetchRequests: function() {
            this.isLoading = true;
            this.error = null;
            
            fetch('/api/service-requests', {
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
                    throw new Error('Failed to fetch service requests');
                }
                return response.json();
            })
            .then(data => {
                this.requests = data;
                this.filteredRequests = [...this.requests];
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching service requests:', error);
                this.error = error.message;
                this.isLoading = false;
            });
        },
        
        filterRequests: function() {
            this.filteredRequests = this.requests.filter(request => {
                // Filter by search query
                const matchesSearch = 
                    this.searchQuery === '' || 
                    request.service_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    request.customer_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    (request.professional_name && request.professional_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
                
                // Filter by status
                const matchesStatus = 
                    this.statusFilter === '' || 
                    request.status === this.statusFilter;
                
                return matchesSearch && matchesStatus;
            });
        },
        
        getStatusBadgeClass: function(status) {
            switch(status) {
                case 'requested':
                    return 'badge bg-warning text-dark';
                case 'assigned':
                    return 'badge bg-primary';
                case 'closed':
                    return 'badge bg-success';
                case 'rejected':
                    return 'badge bg-danger';
                default:
                    return 'badge bg-secondary';
            }
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
        
        viewRequestDetails: function(request) {
            this.selectedRequest = request;
            this.requestDetailsModal.show();
        },
        
        deleteRequest: function(requestId) {
            this.requestToDelete = requestId;
            this.deleteConfirmModal.show();
        },
        
        confirmDelete: function() {
            if (!this.requestToDelete) return;
            
            fetch(`/api/service-requests/${this.requestToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete service request');
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                this.fetchRequests();
            })
            .catch(error => {
                console.error('Error deleting service request:', error);
                alert('Error: ' + error.message);
            });
        }
    },
    mounted: function() {
        document.title = "Service Requests Management - Rise Home Services";
        this.fetchRequests();
        this.requestDetailsModal = new bootstrap.Modal(document.getElementById('requestDetailsModal'));
        this.deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    }
};