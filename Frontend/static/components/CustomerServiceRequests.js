const CustomerServiceRequests = {
    template: `
    <div class="container py-4">
        <h2 class="mb-4">My Service Requests</h2>
        
        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading your service requests...</p>
        </div>
        
        <div v-else-if="error" class="alert alert-danger">
            {{ error }}
        </div>
        
        <div v-else-if="serviceRequests.length === 0" class="text-center py-5">
            <i class="bi bi-inbox" style="font-size: 3rem;"></i>
            <p class="mt-2">You don't have any service requests yet.</p>
            <router-link to="/services" class="btn btn-success mt-3">Browse Services</router-link>
        </div>
        
        <div v-else>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Service</th>
                            <th>Professional</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="request in serviceRequests" :key="request.id">
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
                                <button class="btn btn-sm btn-outline-primary me-1" @click="viewDetails(request)">
                                    <i class="bi bi-eye"></i> View
                                </button>
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

        <!-- Request Details Modal -->
        <div class="modal fade" id="requestDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Request Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" v-if="selectedRequest">
                        <p><strong>Service:</strong> {{ selectedRequest.service_name }}</p>
                        <p><strong>Professional:</strong> {{ selectedRequest.professional_name || 'Not Assigned' }}</p>
                        <p><strong>Status:</strong> {{ selectedRequest.status }}</p>
                        <p><strong>Date Requested:</strong> {{ formatDate(selectedRequest.date_of_request) }}</p>
                        <p v-if="selectedRequest.date_of_completion"><strong>Date Completed:</strong> {{ formatDate(selectedRequest.date_of_completion) }}</p>
                        <p v-if="selectedRequest.remarks"><strong>Remarks:</strong> {{ selectedRequest.remarks }}</p>
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
    data() {
        return {
            serviceRequests: [],
            isLoading: true,
            error: null,
            selectedRequest: null,
            reviewForm: {
                rating: 0,
                review: ''
            },
            isSubmitting: false,
            requestDetailsModal: null,
            reviewModal: null
        };
    },
    methods: {
        fetchServiceRequests() {
            this.isLoading = true;
            fetch('/api/customer/service-requests', {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch service requests');
                }
                return response.json();
            })
            .then(data => {
                this.serviceRequests = data;
                this.isLoading = false;
            })
            .catch(error => {
                this.error = error.message;
                this.isLoading = false;
            });
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleString();
        },
        getStatusBadgeClass(status) {
            switch(status) {
                case 'requested': return 'badge bg-warning text-dark';
                case 'assigned': return 'badge bg-primary';
                case 'closed': return 'badge bg-success';
                default: return 'badge bg-secondary';
            }
        },
        viewDetails(request) {
            this.selectedRequest = request;
            this.requestDetailsModal.show();
        },
        closeRequest(requestId) {
            if (confirm('Are you sure you want to close this service request?')) {
                fetch(`/api/customer/service-requests/${requestId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('token')
                    },
                    body: JSON.stringify({ service_status: 'closed' })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to close service request');
                    }
                    return response.json();
                })
                .then(() => {
                    this.fetchServiceRequests();
                })
                .catch(error => {
                    alert('Error: ' + error.message);
                });
            }
        },
        addReview(requestId) {
            this.selectedRequest = this.serviceRequests.find(req => req.id === requestId);
            this.reviewForm = { rating: 0, review: '' };
            this.reviewModal.show();
        },
        submitReview() {
            if (this.reviewForm.rating === 0) {
                alert('Please select a rating');
                return;
            }
            this.isSubmitting = true;
            fetch(`/api/customer/service-requests/${this.selectedRequest.id}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify(this.reviewForm)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit review');
                }
                return response.json();
            })
            .then(() => {
                this.reviewModal.hide();
                this.fetchServiceRequests();
                this.isSubmitting = false;
            })
            .catch(error => {
                alert('Error: ' + error.message);
                this.isSubmitting = false;
            });
        }
    },
    mounted() {
        this.fetchServiceRequests();
        this.requestDetailsModal = new bootstrap.Modal(document.getElementById('requestDetailsModal'));
        this.reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
    }
};
