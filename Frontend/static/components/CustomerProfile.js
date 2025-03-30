const CustomerProfile = {
    template: `
    <div class="container py-4">
        <div class="row">
            <div class="col-md-8 mx-auto">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h4 class="mb-0">Customer Profile</h4>
                    </div>
                    <div class="card-body">
                        <div v-if="isLoading" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2">Loading your profile...</p>
                        </div>
                        
                        <div v-else-if="error" class="alert alert-danger">
                            {{ error }}
                        </div>
                        
                        <div v-else>
                            <form @submit.prevent="updateProfile">
                                <div class="mb-3">
                                    <label for="name" class="form-label">Full Name</label>
                                    <input type="text" class="form-control" id="name" v-model="profile.name" required>
                                </div>
                                <div class="mb-3">
                                    <label for="address" class="form-label">Address</label>
                                    <textarea class="form-control" id="address" v-model="profile.address" rows="3" required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="pincode" class="form-label">Pincode</label>
                                    <input type="text" class="form-control" id="pincode" v-model="profile.pincode" required>
                                </div>
                                
                                <div class="d-flex justify-content-between">
                                    <router-link to="/customer/dashboard" class="btn btn-outline-secondary">
                                        <i class="bi bi-arrow-left me-2"></i>Back to Dashboard
                                    </router-link>
                                    <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                <div class="card mt-4 shadow">
                    <div class="card-header bg-white">
                        <h4 class="mb-0">Account Information</h4>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Email Address</label>
                            <input type="email" class="form-control" :value="userEmail" disabled>
                            <small class="text-muted">Email cannot be changed</small>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Username</label>
                            <input type="text" class="form-control" :value="username" disabled>
                            <small class="text-muted">Username cannot be changed</small>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Account Created</label>
                            <input type="text" class="form-control" :value="formatDate(profile.date_created)" disabled>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            profile: {
                id: null,
                name: '',
                address: '',
                pincode: '',
                date_created: null
            },
            userEmail: '',
            username: '',
            isLoading: true,
            error: null,
            isSubmitting: false
        }
    },
    methods: {
        fetchProfile: function() {
            this.isLoading = true;
            this.error = null;
            
            fetch('/api/customer/profile', {
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
                    throw new Error('Failed to fetch profile data');
                }
                return response.json();
            })
            .then(data => {
                this.profile = data;
                console.log(this.profile);
                this.userEmail = localStorage.getItem('email') || '';
                this.username = localStorage.getItem('username') || '';
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching profile data:', error);
                this.error = error.message;
                this.isLoading = false;
            });
        },
        
        updateProfile: function() {
            this.isSubmitting = true;
            
            fetch('/api/customer/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    name: this.profile.name,
                    address: this.profile.address,
                    pincode: this.profile.pincode
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update profile');
                }
                return response.json();
            })
            .then(data => {
                alert('Profile updated successfully!');
                this.isSubmitting = false;
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                alert('Error: ' + error.message);
                this.isSubmitting = false;
            });
        },
        
        formatDate: function(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    },
    mounted: function() {
        document.title = "My Profile - Rise Home Services";
        this.fetchProfile();
    }
};
