const CustomerServiceRequestDetails = {
    template: `
    <div class="container py-4">
        <div class="row">
            <div class="col-md-8 mx-auto">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Service Request Details</h2>
                    <router-link to="/customer/service-requests" class="btn btn-outline-secondary">
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
                    <router-link to="/customer/service-requests" class="btn btn-primary mt-3">Back to Requests</router-link>
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
                                    <h6 class="text-muted mb-3">Professional Information</h6>
                                    <p v-if="request.professional_name">
                                        <strong>Professional:</strong> {{ request.professional_name }}
                                    </p>
                                    <p v-else class="text-muted">
                                        <i>No professional assigned yet</i>
                                    </p>
                                </div>
                            </div>
                            
                            <div v-if="request.remarks" class="mb-4">
                                <h6 class="text-muted mb-3">Remarks</h6>
                                <div class="card bg-light">
                                    <div class="card-body">
                                        {{ request.remarks }}
                                    </div>
                                </div>
                            </div>
                            
                            <div v-if="request.review" class="mb-4">
                                <h6 class="text-muted mb-3">Your Review</h6>
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
                                        class="btn btn-success me-2" 
                                        @click="closeRequest">
                                    <i class="bi bi-check-circle me-2"></i>Mark as Completed
                                </button>
                                <button v-if="request.status === 'closed' && !request.rating" 
                                        class="btn btn-primary" 
                                        @click="showReviewModal">
                                    <i class="bi bi-star me-2"></i>Add Review
                                </button>
                            </div>
                        </div>
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
            request: null,
            isLoading: true,
            error: null,
            reviewForm: {
                rating: 0,
                review: ''
            },
            isSubmitting: false,
            reviewModal: null
        }
    },
    methods: {
        fetchRequestDetails: function() {
            this.isLoading = true;
            this.error = null;
            
            const requestId = this.$route.params.id;
            
            fetch(`/api/customer/service-requests/${requestId}`, {
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
        
        closeRequest: function() {
            if (!confirm('Are you sure you want to mark this service request as completed?')) {
                return;
            }
            
            fetch(`/api/customer/service-requests/${this.request.id}`, {
                method: 'GET',
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
                alert('Service request marked as completed successfully!');
                this.fetchRequestDetails();
            })
            .catch(error => {
                console.error('Error closing service request:', error);
                alert('Error: ' + error.message);
            });
        },
        
        showReviewModal: function() {
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
            
            fetch(`/api/customer/service-requests/${this.request.id}/review`, {
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
                alert('Review submitted successfully!');
                this.reviewModal.hide();
                this.fetchRequestDetails();
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
        document.title = "Service Request Details - Rise Home Services";
        this.fetchRequestDetails();
        this.reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
    },
    watch: {
        '$route.params.id': function() {
            this.fetchRequestDetails();
        }
    }
};
