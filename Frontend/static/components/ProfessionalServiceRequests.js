const ProfessionalServiceRequests = {
    template: `
    <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Service Requests</h2>
            <div class="d-flex">
                <select class="form-select me-2" v-model="statusFilter" @change="filterRequests">
                    <option value="">All Status</option>
                    <option value="assigned">Assigned</option>
                    <option value="closed">Completed</option>
                </select>
            </div>
        </div>
        
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
            <i class="bi bi-inbox" style="font-size: 3rem;"></i>
            <p class="mt-2">No service requests found matching your criteria.</p>
        </div>
        
        <div v-else>
            <div class="card mb-4">
                <div class="card-header bg-white">
                    <h5 class="mb-0">{{ statusFilter === 'closed' ? 'Completed Requests' : 'Assigned Requests' }}</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Service</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="request in filteredRequests" :key="request.id">
                                    <td>{{ request.id }}</td>
                                    <td>{{ request.service_name }}</td>
                                    <td>{{ request.customer_name }}</td>
                                    <td>{{ formatDate(request.date_of_request) }}</td>
                                    <td>
                                        <span :class="getStatusBadgeClass(request.status)">
                                            {{ request.status }}
                                        </span>
                                    </td>
                                    <td>
                                    <button class="btn btn-sm btn-outline-primary me-1" @click="viewDetails(request)">
                                        <i class="bi bi-eye"></i> View
                                    </button>
                                    <button v-if="request.status === 'requested'" 
                                            class="btn btn-sm btn-outline-success me-1" 
                                            @click="acceptRequest(request.id)">
                                        <i class="bi bi-check"></i> Accept
                                    </button>
                                    <button v-if="request.status === 'requested'" 
                                            class="btn btn-sm btn-outline-danger me-1" 
                                            @click="rejectRequest(request.id)">
                                        <i class="bi bi-x"></i> Reject
                                    </button>
                                    <button v-if="request.status === 'assigned'" 
                                            class="btn btn-sm btn-outline-success" 
                                            @click="completeRequest(request.id)">
                                        <i class="bi bi-check-circle"></i> Complete
                                    </button>
                                </td>
                                
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Request Details Modal -->
        <div class="modal fade" id="requestDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Request Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" v-if="selectedRequest">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-muted mb-3">Service Information</h6>
                                <p><strong>Service:</strong> {{ selectedRequest.service_name }}</p>
                                <p><strong>Status:</strong> 
                                    <span :class="getStatusBadgeClass(selectedRequest.status)">
                                        {{ selectedRequest.status }}
                                    </span>
                                </p>
                                <p><strong>Date Requested:</strong> {{ formatDate(selectedRequest.date_of_request) }}</p>
                                <p v-if="selectedRequest.date_of_completion">
                                    <strong>Date Completed:</strong> {{ formatDate(selectedRequest.date_of_completion) }}
                                </p>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-muted mb-3">Customer Information</h6>
                                <p><strong>Name:</strong> {{ selectedRequest.customer_name }}</p>
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <h6 class="text-muted mb-3">Remarks</h6>
                            <div v-if="selectedRequest.remarks" class="card bg-light">
                                <div class="card-body">
                                    {{ selectedRequest.remarks }}
                                </div>
                            </div>
                            <div v-else class="card bg-light">
                                <div class="card-body text-muted">
                                    No remarks added yet.
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-4" v-if="selectedRequest.status === 'assigned'">
                            <h6 class="text-muted mb-3">Add Remarks</h6>
                            <div class="mb-3">
                                <textarea class="form-control" v-model="remarkText" rows="3" placeholder="Add your remarks here..."></textarea>
                            </div>
                            <button class="btn btn-primary" @click="addRemarks" :disabled="!remarkText.trim()">
                                Save Remarks
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button v-if="selectedRequest && selectedRequest.status === 'assigned'" 
                                type="button" 
                                class="btn btn-success" 
                                @click="completeRequest(selectedRequest.id)" 
                                data-bs-dismiss="modal">
                            Mark as Completed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            serviceRequests: [],
            filteredRequests: [],
            selectedRequest: null,
            statusFilter: '',
            isLoading: true,
            error: null,
            remarkText: '',
            requestDetailsModal: null
        }
    },
    methods: {
        fetchServiceRequests: function() {
            this.isLoading = true;
            
            fetch('/api/professional/service-requests', {
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
                console.log(data);
                this.serviceRequests = data;
                this.filterRequests();
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching service requests:', error);
                this.error = error.message;
                this.isLoading = false;
            });
        },
        
        filterRequests: function() {
            if (!this.statusFilter) {
                this.filteredRequests = [...this.serviceRequests];
                return;
            }
            
            this.filteredRequests = this.serviceRequests.filter(request => 
                request.status === this.statusFilter
            );
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
        
        viewDetails: function(request) {
            this.selectedRequest = request;
            this.remarkText = '';
            this.requestDetailsModal.show();
        },
        acceptRequest: function(requestId) {
            if (!confirm('Are you sure you want to accept this service request?')) {
                return;
            }
            
            fetch(`/api/professional/service-requests/${requestId}/accept`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to accept service request');
                }
                return response.json();
            })
            .then(data => {
                alert('Service request accepted successfully!');
                this.fetchServiceRequests();
            })
            .catch(error => {
                console.error('Error accepting service request:', error);
                alert('Error: ' + error.message);
            });
        },
        
        rejectRequest: function(requestId) {
            if (!confirm('Are you sure you want to reject this service request?')) {
                return;
            }
            
            fetch(`/api/professional/service-requests/${requestId}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to reject service request');
                }
                return response.json();
            })
            .then(data => {
                alert('Service request rejected successfully!');
                this.fetchServiceRequests();
            })
            .catch(error => {
                console.error('Error rejecting service request:', error);
                alert('Error: ' + error.message);
            });
        },        
        completeRequest: function(requestId) {
            if (!confirm('Are you sure you want to mark this service request as completed?')) {
                return;
            }
            
            fetch(`/api/professional/service-requests/${requestId}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to complete service request');
                }
                return response.json();
            })
            .then(data => {
                alert('Service request marked as completed successfully!');
                if (this.requestDetailsModal) {
                    this.requestDetailsModal.hide();
                }
                this.fetchServiceRequests();
            })
            .catch(error => {
                console.error('Error completing service request:', error);
                alert('Error: ' + error.message);
            });
        },
        
        addRemarks: function() {
            if (!this.remarkText.trim()) {
                return;
            }
            
            fetch(`/api/professional/service-requests/${this.selectedRequest.id}/remarks`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    remarks: this.remarkText
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add remarks');
                }
                return response.json();
            })
            .then(data => {
                alert('Remarks added successfully!');
                this.selectedRequest.remarks = this.remarkText;
                this.remarkText = '';
            })
            .catch(error => {
                console.error('Error adding remarks:', error);
                alert('Error: ' + error.message);
            });
        }
    },
    mounted: function() {
        document.title = "Service Requests - Rise Home Services";
        this.fetchServiceRequests();
        this.requestDetailsModal = new bootstrap.Modal(document.getElementById('requestDetailsModal'));
    }
};
