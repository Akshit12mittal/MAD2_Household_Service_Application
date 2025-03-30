const CustomerDashboard = {
    template: `
    <div class="container py-4">
        <h2 class="mb-4">Customer Dashboard</h2>
        
        <!-- Summary Cards -->
        <div class="row g-4 mb-5">
            <div class="col-md-4">
                <div class="card bg-primary text-white h-100">
                    <div class="card-body">
                        <h5 class="card-title">Total Service Requests</h5>
                        <h2 class="display-4 mb-0">{{ dashboard.total_service_requests }}</h2>
                    </div>
                    <div class="card-footer d-flex align-items-center">
                        <span>View All</span>
                        <router-link to="/customer/service-requests" class="ms-auto text-white">
                            <i class="bi bi-arrow-right-circle"></i>
                        </router-link>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card bg-success text-white h-100">
                    <div class="card-body">
                        <h5 class="card-title">Open Requests</h5>
                        <h2 class="display-4 mb-0">{{ getRequestCountByStatus('requested') + getRequestCountByStatus('assigned') }}</h2>
                    </div>
                    <div class="card-footer d-flex align-items-center">
                        <span>View Open</span>
                        <router-link to="/customer/service-requests" class="ms-auto text-white">
                            <i class="bi bi-arrow-right-circle"></i>
                        </router-link>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card bg-info text-white h-100">
                    <div class="card-body">
                        <h5 class="card-title">Completed Requests</h5>
                        <h2 class="display-4 mb-0">{{ getRequestCountByStatus('closed') }}</h2>
                    </div>
                    <div class="card-footer d-flex align-items-center">
                        <span>View Completed</span>
                        <router-link to="/customer/service-requests" class="ms-auto text-white">
                            <i class="bi bi-arrow-right-circle"></i>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Recent Service Requests -->
        <div class="card mb-5">
            <div class="card-header bg-white d-flex align-items-center">
                <h5 class="mb-0">Recent Service Requests</h5>
                <router-link to="/customer/service-requests" class="btn btn-sm btn-outline-primary ms-auto">View All</router-link>
            </div>
            <div class="card-body">
                <div v-if="isLoading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading your dashboard...</p>
                </div>
                
                <div v-else-if="error" class="alert alert-danger">
                    {{ error }}
                </div>
                
                <div v-else-if="dashboard.service_requests.length === 0" class="text-center py-5">
                    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                    <p class="mt-2">You don't have any service requests yet.</p>
                    <router-link to="/services" class="btn btn-success mt-3">Browse Services</router-link>
                </div>
                
                <div v-else class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Service</th>
                                <th>Professional</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="request in dashboard.service_requests" :key="request.id">
                                <td>{{ request.id }}</td>
                                <td>{{ request.service_name }}</td>
                                <td>{{ request.professional_name || 'Not Assigned' }}</td>
                                <td>{{ formatDate(request.date_of_request) }}</td>
                                <td>
                                    <span :class="getStatusBadgeClass(request.status)">
                                        {{ request.status }}
                                    </span>
                                </td>
                                <td>
                                    <button v-if="request.status === 'assigned'" 
                                            class="btn btn-sm btn-outline-success" 
                                            @click="closeRequest(request.id)">
                                        <i class="bi bi-check-circle"></i> Close
                                    </button>
                                    <button v-if="request.status === 'closed' && !request.rating" 
                                            class="btn btn-sm btn-outline-warning" 
                                            @click="addReview(request.id)">
                                        <i class="bi bi-star"></i> Review
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="bi bi-plus-circle text-success mb-3" style="font-size: 2rem;"></i>
                        <h5 class="card-title">Request a New Service</h5>
                        <p class="card-text">Browse our services and create a new service request.</p>
                        <router-link to="/services" class="btn btn-success">Browse Services</router-link>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="bi bi-person-circle text-primary mb-3" style="font-size: 2rem;"></i>
                        <h5 class="card-title">Update Your Profile</h5>
                        <p class="card-text">Update your personal information and address details.</p>
                        <router-link to="/customer/profile" class="btn btn-primary">View Profile</router-link>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Review Modal -->
        <div class="modal fade" id="reviewModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Review</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="submitReview">
                            <div class="mb-3">
                                <label class="form-label">Rating</label>
                                <div class="d-flex">
                                    <div v-for="n in 5" :key="n" class="me-2">
                                        <i class="bi" 
                                           :class="n <= reviewForm.rating ? 'bi-star-fill text-warning' : 'bi-star'" 
                                           style="font-size: 2rem; cursor: pointer;"
                                           @click="reviewForm.rating = n"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="review" class="form-label">Review</label>
                                <textarea class="form-control" id="review" v-model="reviewForm.review" rows="3" required></textarea>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
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
            dashboard: {
                customer_id: null,
                name: '',
                total_service_requests: 0,
                service_requests: []
            },
            isLoading: true,
            error: null,
            selectedRequestId: null,
            reviewForm: {
                rating: 0,
                review: ''
            },
            isSubmitting: false,
            reviewModal: null
        }
    },
    methods: {
        fetchDashboard: function() {
            this.isLoading = true;
            this.error = null;
            
            fetch('/api/customer/dashboard', {
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
                    throw new Error('Failed to fetch dashboard data');
                }
                return response.json();
            })
            .then(data => {
                this.dashboard = data;
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching dashboard data:', error);
                this.error = error.message;
                this.isLoading = false;
            });
        },
        
        getRequestCountByStatus: function(status) {
            return this.dashboard.service_requests.filter(req => req.status === status).length;
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
        
        closeRequest: function(requestId) {
            if (!confirm('Are you sure you want to close this service request?')) {
                return;
            }
            
            fetch(`/api/customer/service-requests/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    service_status: 'closed'
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to close service request');
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                this.fetchDashboard();
            })
            .catch(error => {
                console.error('Error closing service request:', error);
                alert('Error: ' + error.message);
            });
        },
        
        addReview: function(requestId) {
            this.selectedRequestId = requestId;
            this.reviewForm = {
                rating: 0,
                review: ''
            };
            this.reviewModal.show();
        },
        
        submitReview: function() {
            if (this.reviewForm.rating === 0) {
                alert('Please select a rating');
                return;
            }
            
            this.isSubmitting = true;
            
            fetch(`/api/customer/service-requests/${this.selectedRequestId}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    rating: this.reviewForm.rating,
                    review: this.reviewForm.review
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit review');
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                this.reviewModal.hide();
                this.fetchDashboard();
                this.isSubmitting = false;
            })
            .catch(error => {
                console.error('Error submitting review:', error);
                alert('Error: ' + error.message);
                this.isSubmitting = false;
            });
        }
    },
    mounted: function() {
        document.title = "Customer Dashboard - Rise Home Services";
        this.fetchDashboard();
        this.reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
    }
};
