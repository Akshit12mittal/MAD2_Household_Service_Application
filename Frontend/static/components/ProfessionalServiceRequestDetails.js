const ProfessionalServiceRequestDetails = {
    template: `
    <div class="container py-4">
        <div class="row">
            <div class="col-md-8 mx-auto">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Service Request Details</h2>
                    <router-link to="/professional/service-requests" class="btn btn-outline-secondary">
                        <i class="bi bi-arrow-left me-2"></i>Back to Requests
                    </router-link>
                </div>
                
                <div v-if="isLoading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading request details...</p>
                </div>
                
                <div v-else-if="error" class="alert alert-danger">
                    {{ error }}
                </div>
                
                <div v-else-if="!request" class="text-center py-5">
                    <i class="bi bi-exclamation-triangle" style="font-size: 3rem;"></i>
                    <p class="mt-2">Service request not found.</p>
                    <router-link to="/professional/service-requests" class="btn btn-primary mt-3">Back to Requests</router-link>
                </div>
                
                <div v-else>
                    <div class="card shadow mb-4">
                        <div class="card-header bg-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Request #{{ request.id }}</h5>
                                <span :class="getStatusBadgeClass(request.status)">
                                    {{ request.status }}
                                </span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <h6 class="text-muted mb-3">Service Information</h6>
                                    <p><strong>Service:</strong> {{ request.service_name }}</p>
                                    <p><strong>Date Requested:</strong> {{ formatDate(request.date_of_request) }}</p>
                                    <p v-if="request.date_of_completion">
                                        <strong>Date Completed:</strong> {{ formatDate(request.date_of_completion) }}
                                    </p>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-muted mb-3">Customer Information</h6>
                                    <p><strong>Customer:</strong> {{ request.customer_name }}</p>
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <h6 class="text-muted mb-3">Remarks</h6>
                                <div v-if="request.remarks" class="card bg-light">
                                    <div class="card-body">
                                        {{ request.remarks }}
                                    </div>
                                </div>
                                <div v-else class="card bg-light">
                                    <div class="card-body text-muted">
                                        No remarks added yet.
                                    </div>
                                </div>
                            </div>
                            
                            <div v-if="request.status === 'assigned'" class="mb-4">
                                <h6 class="text-muted mb-3">Add/Update Remarks</h6>
                                <div class="mb-3">
                                    <textarea class="form-control" v-model="remarkText" rows="3" placeholder="Add your remarks here..."></textarea>
                                </div>
                                <button class="btn btn-primary" @click="addRemarks" :disabled="!remarkText.trim()">
                                    Save Remarks
                                </button>
                            </div>
                            
                            <div v-if="request.status === 'closed' && request.review" class="mb-4">
                                <h6 class="text-muted mb-3">Customer Review</h6>
                                <div class="card bg-light">
                                    <div class="card-body">
                                        <div class="d-flex mb-2">
                                            <div v-for="n in 5" :key="n" class="me-1">
                                                <i class="bi" :class="n <= request.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'"></i>
                                            </div>
                                        </div>
                                        <p class="mb-0">{{ request.review }}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="d-flex justify-content-end">
                                <button v-if="request.status === 'assigned'" 
                                        class="btn btn-success" 
                                        @click="completeRequest">
                                    <i class="bi bi-check-circle me-2"></i>Mark as Completed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            request: null,
            isLoading: true,
            error: null,
            remarkText: ''
        }
    },
    methods: {
        fetchRequestDetails: function() {
            this.isLoading = true;
            this.error = null;
            
            const requestId = this.$route.params.id;
            
            fetch(`/api/professional/service-requests/${requestId}`, {
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
                    throw new Error('Failed to fetch request details');
                }
                return response.json();
            })
            .then(data => {
                this.request = data;
                this.remarkText = this.request.remarks || '';
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching request details:', error);
                this.error = error.message;
                this.isLoading = false;
            });
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
        
        addRemarks: function() {
            if (!this.remarkText.trim()) {
                return;
            }
            
            fetch(`/api/professional/service-requests/${this.request.id}/remarks`, {
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
                this.request.remarks = this.remarkText;
            })
            .catch(error => {
                console.error('Error adding remarks:', error);
                alert('Error: ' + error.message);
            });
        },
        
        completeRequest: function() {
            if (!confirm('Are you sure you want to mark this service request as completed?')) {
                return;
            }
            
            fetch(`/api/professional/service-requests/${this.request.id}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
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
                this.$router.push('/professional/service-requests');
            })
            .catch(error => {
                console.error('Error completing service request:', error);
                alert('Error: ' + error.message);
            });
        }
    },
    mounted: function() {
        document.title = "Service Request Details - Rise Home Services";
        this.fetchRequestDetails();
    },
    watch: {
        '$route.params.id': function() {
            this.fetchRequestDetails();
        }
    }
};