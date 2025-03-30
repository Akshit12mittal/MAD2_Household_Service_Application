const Navbar = {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark" style="background: linear-gradient(90deg,rgb(0, 148, 64) 0%,rgb(0, 0, 0) 80%);">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#">
                <i class="bi bi-house-fill me-2"></i>
                Rise Home Services
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <router-link class="nav-link" to="/">Home</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/services">Services</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/about">About Us</router-link>
                    </li>
                    
                    <!-- Admin Navigation -->
                    <<li v-if="isAdmin" class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown">
                            Admin
                        </a>
                        <ul class="dropdown-menu">
                            <li><router-link class="dropdown-item" to="/admin/dashboard">Dashboard</router-link></li>
                            <li><router-link class="dropdown-item" to="/admin/users">Users</router-link></li>
                            <li><router-link class="dropdown-item" to="/admin/professionals">Professionals</router-link></li>
                            <li><router-link class="dropdown-item" to="/admin/services">Services</router-link></li>
                            <li><router-link class="dropdown-item" to="/admin/service-requests">Service Requests</router-link></li>
                        </ul>
                    </li>
                    
                    <!-- Professional Navigation -->
                    <li v-if="isProfessional" class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="proDropdown" role="button" data-bs-toggle="dropdown">
                            Professional
                        </a>
                        <ul class="dropdown-menu">
                            <li><router-link class="dropdown-item" to="/professional/dashboard">Dashboard</router-link></li>
                            <li><router-link class="dropdown-item" to="/professional/profile">My Profile</router-link></li>
                            <li><router-link class="dropdown-item" to="/professional/service-requests">Service Requests</router-link></li>
                        </ul>
                    </li>
                    
                    <!-- Customer Navigation -->
                    <li v-if="isCustomer" class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="customerDropdown" role="button" data-bs-toggle="dropdown">
                            Customer
                        </a>
                        <ul class="dropdown-menu">
                            <li><router-link class="dropdown-item" to="/customer/dashboard">Dashboard</router-link></li>
                            <li><router-link class="dropdown-item" to="/customer/profile">My Profile</router-link></li>
                            <li><router-link class="dropdown-item" to="/customer/service-requests">My Requests</router-link></li>
                            <li><router-link class="dropdown-item" to="/customer/create-request">New Request</router-link></li>
                        </ul>
                    </li>
                </ul>
                <div class="d-flex" v-if="!isLoggedIn">
                    <router-link to="/login" class="btn btn-outline-light me-2 rounded-pill px-4">Login</router-link>
                    <router-link to="/customer-register" class="btn btn-light rounded-pill px-4 me-2">Customer Register</router-link>
                    <router-link to="/professional-register" class="btn btn-warning rounded-pill px-4">Professional Register</router-link>
                </div>
                <div class="d-flex align-items-center" v-else>
                    <span class="text-white me-3">Welcome, {{ username }}</span>
                    <button @click="logout" class="btn btn-outline-light rounded-pill px-4">Logout</button>
                </div>
            </div>
        </div>
    </nav>
    `,
    data: function() {
        return {
            isLoggedIn: false,
            isAdmin: false,
            isProfessional: false,
            isCustomer: false,
            username: ''
        }
    },
    methods: {
        checkLoginStatus: function() {
            const token = localStorage.getItem('token');
            const userRoles = localStorage.getItem('userRoles') ? JSON.parse(localStorage.getItem('userRoles')) : [];
            
            this.isLoggedIn = !!token;
            this.isAdmin = userRoles.includes('admin');
            this.isProfessional = userRoles.includes('professional');
            this.isCustomer = userRoles.includes('customer');
            this.username = localStorage.getItem('username') || 'User';
        },
        logout: function() {
            fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => response.json())
            .then(data => {
                localStorage.removeItem('token');
                localStorage.removeItem('userRoles');
                localStorage.removeItem('username');
                this.isLoggedIn = false;
                this.isAdmin = false;
                this.isProfessional = false;
                this.isCustomer = false;
                this.$router.push('/login');
            })
            .catch(error => {
                console.error('Logout error:', error);
                // Even if the API call fails, we should still clear local storage
                localStorage.removeItem('token');
                localStorage.removeItem('userRoles');
                localStorage.removeItem('username');
                this.isLoggedIn = false;
                this.isAdmin = false;
                this.isProfessional = false;
                this.isCustomer = false;
                this.$router.push('/login');
            });
        }
    },
    mounted: function() {
        this.checkLoginStatus();
    },
    // Re-check login status when route changes
    watch: {
        '$route': function() {
            this.checkLoginStatus();
        }
    }
};
