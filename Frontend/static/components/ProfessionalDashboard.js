const ProfessionalDashboard = {
    template: `
    <div class="container py-4">
        <h2 class="mb-4">Professional Dashboard</h2>
        
        <!-- Summary Cards -->
        <div class="row g-4 mb-5">
            <div class="col-md-4">
                <div class="card bg-primary text-white h-100">
                    <div class="card-body">
                        <h5 class="card-title">Assigned Requests</h5>
                        <h2 class="display-4 mb-0">{{ dashboard.total_assigned_requests }}</h2>
                    </div>
                    <div class="card-footer d-flex align-items-center">
                        <span>View All</span>
                        <router-link to="/professional/service-requests" class="ms-auto text-white">
                            <i class="bi bi-arrow-right-circle"></i>
                        </router-link>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card bg-success text-white h-100">
                    <div class="card-body">
                        <h5 class="card-title">Completed Requests</h5>
                        <h2 class="display-4 mb-0">{{ dashboard.total_closed_requests }}</h2>
                    </div>
                    <div class="card-footer d-flex align-items-center">
                        <span>View History</span>
                        <router-link to="/professional/service-requests?status=closed" class="ms-auto text-white">
                            <i class="bi bi-arrow-right-circle"></i>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Recent Assigned Requests -->
        <div class="card mb-5">
            <div class="card-header bg-white d-flex align-items-center">
                <h5 class="mb-0">Recent Assigned Requests</h5>
                <router-link to="/professional/service-requests" class="btn btn-sm btn-outline-primary ms-auto">View All</router-link>
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
                
                <div v-else-if="dashboard.assigned_requests.length === 0" class="text-center py-5">
                    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                    <p class="mt-2">You don't have any assigned service requests yet.</p>
                </div>
                
                <div v-else class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Service</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="request in dashboard.assigned_requests" :key="request.id">
                                <td>{{ request.id }}</td>
                                <td>{{ request.service_name }}</td>
                                <td>{{ request.customer_name }}</td>
                                <td>{{ formatDate(request.date_of_request) }}</td>
                                <td>

                                    <button class="btn btn-sm btn-outline-success" @click="completeRequest(request.id)">
                                        <i class="bi bi-check-circle"></i> Complete
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Recent Completed Requests -->
        <div class="card">
            <div class="card-header bg-white d-flex align-items-center">
                <h5 class="mb-0">Recently Completed Requests</h5>
                <router-link to="/professional/service-requests?status=closed" class="btn btn-sm btn-outline-primary ms-auto">View All</router-link>
            </div>
            <div class="card-body">
                <div v-if="dashboard.closed_requests.length === 0" class="text-center py-5">
                    <i class="bi bi-clipboard-check" style="font-size: 3rem;"></i>
                    <p class="mt-2">You haven't completed any service requests yet.</p>
                </div>
                
                <div v-else class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Service</th>
                                <th>Customer</th>
                                <th>Completed On</th>
                                <th>Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="request in dashboard.closed_requests" :key="request.id">
                                <td>{{ request.id }}</td>
                                <td>{{ request.service_name }}</td>
                                <td>{{ request.customer_name }}</td>
                                <td>{{ formatDate(request.date_of_completion) }}</td>
                                <td>
                                    <div v-if="request.rating" class="d-flex">
                                        <div v-for="n in 5" :key="n" class="me-1">
                                            <i class="bi" :class="n <= request.rating ? 'bi-star-fill text-warning' : 'bi-star'"></i>
                                        </div>
                                    </div>
                                    <span v-else class="text-muted">Not rated yet</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            dashboard: {
                professional_id: null,
                name: '',
                is_approved: false,
                total_assigned_requests: 0,
                total_closed_requests: 0,
                assigned_requests: [],
                closed_requests: []
            },
            isLoading: true,
            error: null
        }
    },
    methods: {
        fetchDashboard: function() {
            this.isLoading = true;
            this.error = null;
            
            fetch('/api/professional/dashboard', {
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
                this.fetchDashboard();
            })
            .catch(error => {
                console.error('Error completing service request:', error);
                alert('Error: ' + error.message);
            });
        }
    },
    mounted: function() {
        document.title = "Professional Dashboard - Rise Home Services";
        this.fetchDashboard();
    }
};
