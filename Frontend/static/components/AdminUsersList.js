const AdminUsersList = {
    template: `
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Users Management</h2>
                    <div class="d-flex">
                        <div class="input-group me-2" style="width: 300px;">
                            <input type="text" class="form-control" placeholder="Search users..." v-model="searchQuery" @input="filterUsers">
                            <button class="btn btn-outline-secondary" type="button">
                                <i class="bi bi-search"></i>
                            </button>
                        </div>
                        <select class="form-select me-2" style="width: 150px;" v-model="roleFilter" @change="filterUsers">
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="customer">Customer</option>
                            <option value="professional">Professional</option>
                        </select>
                        <select class="form-select" style="width: 150px;" v-model="statusFilter" @change="filterUsers">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <div v-if="isLoading" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2">Loading users...</p>
                        </div>
                        
                        <div v-else-if="error" class="alert alert-danger">
                            {{ error }}
                        </div>
                        
                        <div v-else-if="filteredUsers.length === 0" class="text-center py-5">
                            <i class="bi bi-search" style="font-size: 3rem;"></i>
                            <p class="mt-2">No users found matching your criteria.</p>
                        </div>
                        
                        <div v-else class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Roles</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="user in filteredUsers" :key="user.id">
                                        <td>{{ user.id }}</td>
                                        <td>{{ user.username }}</td>
                                        <td>{{ user.email }}</td>
                                        <td>{{ user.phone }}</td>
                                        <td>
                                            <span v-for="role in user.roles" :key="role" 
                                                  :class="getRoleBadgeClass(role)" 
                                                  class="badge me-1">
                                                {{ role }}
                                            </span>
                                        </td>
                                        <td>
                                            <span :class="user.active ? 'badge bg-success' : 'badge bg-danger'">
                                                {{ user.active ? 'Active' : 'Inactive' }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group">
                                                <button class="btn btn-sm btn-outline-primary" @click="viewUserDetails(user)">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <button v-if="user.active" 
                                                        class="btn btn-sm btn-outline-danger" 
                                                        @click="blockUser(user.id)"
                                                        :disabled="user.roles.includes('admin')">
                                                    <i class="bi bi-lock"></i> Block
                                                </button>
                                                <button v-else 
                                                        class="btn btn-sm btn-outline-success" 
                                                        @click="unblockUser(user.id)">
                                                    <i class="bi bi-unlock"></i> Unblock
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
        
        <!-- User Details Modal -->
        <div class="modal fade" id="userDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">User Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" v-if="selectedUser">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-muted mb-3">Basic Information</h6>
                                <p><strong>ID:</strong> {{ selectedUser.id }}</p>
                                <p><strong>Username:</strong> {{ selectedUser.username }}</p>
                                <p><strong>Email:</strong> {{ selectedUser.email }}</p>
                                <p><strong>Phone:</strong> {{ selectedUser.phone }}</p>
                                <p>
                                    <strong>Status:</strong> 
                                    <span :class="selectedUser.active ? 'badge bg-success' : 'badge bg-danger'">
                                        {{ selectedUser.active ? 'Active' : 'Inactive' }}
                                    </span>
                                </p>
                                <p>
                                    <strong>Roles:</strong>
                                    <span v-for="role in selectedUser.roles" :key="role" 
                                          :class="getRoleBadgeClass(role)" 
                                          class="badge me-1">
                                        {{ role }}
                                    </span>
                                </p>
                            </div>
                            
                            <div class="col-md-6" v-if="selectedUser.customer">
                                <h6 class="text-muted mb-3">Customer Details</h6>
                                <p><strong>Name:</strong> {{ selectedUser.customer.name }}</p>
                                <p><strong>Address:</strong> {{ selectedUser.customer.address }}</p>
                                <p><strong>Pincode:</strong> {{ selectedUser.customer.pincode }}</p>
                            </div>
                            
                            <div class="col-md-6" v-if="selectedUser.professional">
                                <h6 class="text-muted mb-3">Professional Details</h6>
                                <p><strong>Name:</strong> {{ selectedUser.professional.name }}</p>
                                <p><strong>Service ID:</strong> {{ selectedUser.professional.service_id }}</p>
                                <p>
                                    <strong>Approval Status:</strong>
                                    <span :class="selectedUser.professional.is_approved ? 'badge bg-success' : 'badge bg-warning text-dark'">
                                        {{ selectedUser.professional.is_approved ? 'Approved' : 'Pending' }}
                                    </span>
                                </p>
                                <p>
                                    <strong>Block Status:</strong>
                                    <span :class="selectedUser.professional.is_blocked ? 'badge bg-danger' : 'badge bg-success'">
                                        {{ selectedUser.professional.is_blocked ? 'Blocked' : 'Active' }}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button v-if="selectedUser && selectedUser.active" 
                                type="button" 
                                class="btn btn-danger" 
                                @click="blockUser(selectedUser.id)"
                                :disabled="selectedUser.roles && selectedUser.roles.includes('admin')"
                                data-bs-dismiss="modal">
                            Block User
                        </button>
                        <button v-else-if="selectedUser && !selectedUser.active" 
                                type="button" 
                                class="btn btn-success" 
                                @click="unblockUser(selectedUser.id)"
                                data-bs-dismiss="modal">
                            Unblock User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            users: [],
            filteredUsers: [],
            selectedUser: null,
            isLoading: true,
            error: null,
            searchQuery: '',
            roleFilter: '',
            statusFilter: '',
            userDetailsModal: null
        }
    },
    methods: {
        fetchUsers: function() {
            this.isLoading = true;
            this.error = null;
            
            fetch('/api/admin/users', {
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
                    throw new Error('Failed to fetch users');
                }
                return response.json();
            })
            .then(data => {
                this.users = data;
                this.filteredUsers = [...this.users];
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                this.error = error.message;
                this.isLoading = false;
            });
        },
        
        filterUsers: function() {
            this.filteredUsers = this.users.filter(user => {
                // Filter by search query
                const matchesSearch = 
                    this.searchQuery === '' || 
                    user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
                
                // Filter by role
                const matchesRole = 
                    this.roleFilter === '' || 
                    user.roles.includes(this.roleFilter);
                
                // Filter by status
                const matchesStatus = 
                    this.statusFilter === '' || 
                    (this.statusFilter === 'active' && user.active) || 
                    (this.statusFilter === 'inactive' && !user.active);
                
                return matchesSearch && matchesRole && matchesStatus;
            });
        },
        
        getRoleBadgeClass: function(role) {
            switch(role) {
                case 'admin':
                    return 'bg-danger';
                case 'customer':
                    return 'bg-primary';
                case 'professional':
                    return 'bg-warning text-dark';
                default:
                    return 'bg-secondary';
            }
        },
        
        viewUserDetails: function(user) {
            this.selectedUser = user;
            this.userDetailsModal.show();
        },
        
        blockUser: function(userId) {
            if (!confirm('Are you sure you want to block this user?')) {
                return;
            }
            
            fetch(`/api/admin/users/${userId}/block`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to block user');
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                this.fetchUsers();
            })
            .catch(error => {
                console.error('Error blocking user:', error);
                alert('Error: ' + error.message);
            });
        },
        
        unblockUser: function(userId) {
            if (!confirm('Are you sure you want to unblock this user?')) {
                return;
            }
            
            fetch(`/api/admin/users/${userId}/unblock`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to unblock user');
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                this.fetchUsers();
            })
            .catch(error => {
                console.error('Error unblocking user:', error);
                alert('Error: ' + error.message);
            });
        }
    },
    mounted: function() {
        document.title = "Users Management - Rise Home Services";
        this.fetchUsers();
        this.userDetailsModal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
    }
};
