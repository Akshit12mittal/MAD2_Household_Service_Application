const AdminDashboard = {
    template: `
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-12">
                <h2 class="mb-4">Admin Dashboard</h2>
                <div class="row g-4 mb-5">
                    <div class="col-md-3">
                        <div class="card bg-primary text-white h-100">
                            <div class="card-body">
                                <h5 class="card-title">Total Users</h5>
                                <h2 class="display-4 mb-0">{{ summary.total_users }}</h2>
                            </div>
                            <div class="card-footer d-flex align-items-center">
                                <span>View Details</span>
                                <router-link to="/admin/users" class="ms-auto text-white">
                                    <i class="bi bi-arrow-right-circle"></i>
                                </router-link>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="card bg-success text-white h-100">
                            <div class="card-body">
                                <h5 class="card-title">Total Customers</h5>
                                <h2 class="display-4 mb-0">{{ summary.total_customers }}</h2>
                            </div>
                            <div class="card-footer d-flex align-items-center">
                                <span>View Details</span>
                                <router-link to="/admin/users" class="ms-auto text-white">
                                    <i class="bi bi-arrow-right-circle"></i>
                                </router-link>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="card bg-warning text-white h-100">
                            <div class="card-body">
                                <h5 class="card-title">Total Professionals</h5>
                                <h2 class="display-4 mb-0">{{ summary.total_professionals }}</h2>
                            </div>
                            <div class="card-footer d-flex align-items-center">
                                <span>View Details</span>
                                <router-link to="/admin/professionals" class="ms-auto text-white">
                                    <i class="bi bi-arrow-right-circle"></i>
                                </router-link>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="card bg-info text-white h-100">
                            <div class="card-body">
                                <h5 class="card-title">Total Services</h5>
                                <h2 class="display-4 mb-0">{{ summary.total_services }}</h2>
                            </div>
                            <div class="card-footer d-flex align-items-center">
                                <span>View Details</span>
                                <router-link to="/admin/services" class="ms-auto text-white">
                                    <i class="bi bi-arrow-right-circle"></i>
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card mb-5">
                    <div class="card-header bg-white d-flex align-items-center">
                        <h5 class="mb-0">Recent Service Requests</h5>
                        <router-link to="/admin/service-requests" class="btn btn-sm btn-outline-primary ms-auto">View All</router-link>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Service</th>
                                        <th>Customer</th>
                                        <th>Professional</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="request in details.recent_service_requests" :key="request.id">
                                        <td>{{ request.id }}</td>
                                        <td>{{ request.service_name }}</td>
                                        <td>{{ request.customer_name }}</td>
                                        <td>{{ request.professional_name || 'Not Assigned' }}</td>
                                        <td>
                                            <span :class="getStatusBadgeClass(request.status)">
                                                {{ request.status }}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr v-if="details.recent_service_requests.length === 0">
                                        <td colspan="6" class="text-center">No recent service requests</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Professionals -->
                <div class="card">
                    <div class="card-header bg-white d-flex align-items-center">
                        <h5 class="mb-0">Recent Professional Registrations</h5>
                        <router-link to="/admin/professionals" class="btn btn-sm btn-outline-primary ms-auto">View All</router-link>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Service</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="professional in details.recent_professionals" :key="professional.id">
                                        <td>{{ professional.id }}</td>
                                        <td>{{ professional.name }}</td>
                                        <td>{{ professional.service_name }}</td>
                                        <td>
                                            <span :class="getApprovalBadgeClass(professional.is_approved)">
                                                {{ professional.is_approved ? 'Approved' : 'Pending' }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group">
                                                <button v-if="!professional.is_approved" @click="approveProfessional(professional.id)" class="btn btn-sm btn-success">
                                                    <i class="bi bi-check-circle"></i> Approve
                                                </button>
                                                <button v-if="professional.is_approved" @click="rejectProfessional(professional.id)" class="btn btn-sm btn-danger">
                                                    <i class="bi bi-x-circle"></i> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="details.recent_professionals.length === 0">
                                        <td colspan="5" class="text-center">No recent professional registrations</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            summary: {
                total_users: 0,
                total_customers: 0,
                total_professionals: 0,
                total_services: 0,
                total_service_requests: 0
            },
            details: {
                recent_service_requests: [],
                recent_professionals: []
            },
            isLoading: true,
            error: null
        }
    },
    methods: {
        fetchDashboardData: function() {
            this.isLoading = true;
            
            fetch('/api/admin/dashboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${localStorage.getItem('token')}`
                } 
            })
            .then(response => {
                console.log('Response status:', response.status);
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
                this.summary = data.summary;
                this.details = data.details;
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching dashboard data:', error);
                this.error = error.message;
                this.isLoading = false;
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
        
        getApprovalBadgeClass: function(isApproved) {
            return isApproved ? 'badge bg-success' : 'badge bg-warning text-dark';
        },
        
        approveProfessional: function(professionalId) {
            if (!confirm('Are you sure you want to approve this professional?')) {
                return;
            }
            
            fetch(`/api/admin/professionals/${professionalId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${localStorage.getItem('token')}`
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
                this.fetchDashboardData();
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
                    'Authorization': `${localStorage.getItem('token')}`
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
                this.fetchDashboardData();
            })
            .catch(error => {
                console.error('Error rejecting professional:', error);
                alert('Error: ' + error.message);
            });
        }
    },
    mounted: function() {
        document.title = "Admin Dashboard - Rise Home Services";
        this.fetchDashboardData();
    }
};
