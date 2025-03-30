const routes = [
    {path: "/", component: Home},
    {path: "/login", component: Login},
    {path: "/about", component: AboutUs},
    {path: "/customer-register", component: CustomerRegister},
    {path: "/professional-register", component: ProfessionalRegister},
    {path: "/services", component: Services},
    {path: "/admin/dashboard", component: AdminDashboard, meta: {requiresAuth: true, requiresAdmin: true}},
    {path: "/admin/users", component: AdminUsersList, meta: {requiresAuth: true, requiresAdmin: true}},
    {path: "/admin/professionals", component: AdminProfessionalsList, meta: {requiresAuth: true, requiresAdmin: true}},
    {path: "/admin/services", component: AdminServiceManagement, meta: {requiresAuth: true, requiresAdmin: true}},
    {path: "/admin/service-requests", component: AdminServiceRequestsList, meta: {requiresAuth: true, requiresAdmin: true}},
    {path: "/customer/dashboard", component: CustomerDashboard, meta: {requiresAuth: true}},
    {path: "/customer/profile", component: CustomerProfile, meta: {requiresAuth: true}},
    {path: "/customer/service-requests", component: CustomerServiceRequests, meta: {requiresAuth: true}},
    {path: "/customer/create-requests/detail", component: CustomerServiceRequestDetails, meta: {requiresAuth: true}},
    {path: "/customer/create-request", component: CustomerCreateRequest, meta: {requiresAuth: true}},
    {path: "/professional/dashboard", component: ProfessionalDashboard, meta: {requiresAuth: true}},
    {path: "/professional/profile", component: ProfessionalProfile, meta: {requiresAuth: true}},
    {path: "/professional/service-requests", component: ProfessionalServiceRequests, meta: {requiresAuth: true}},
    {path: "/professional/service-requests/detail", component: ProfessionalServiceRequestDetails, meta: {requiresAuth: true}}
];

const router = new VueRouter({
    routes,
    mode: 'history'  // Use history mode for cleaner URLs
});
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const userRoles = localStorage.getItem('userRoles') ? JSON.parse(localStorage.getItem('userRoles')) : [];
    
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!token) {
            next('/login');
        } else if (to.matched.some(record => record.meta.requiresAdmin) && !userRoles.includes('admin')) {
            next('/unauthorized');
        } else {
            next();
        }
    } else {
        next();
    }
});

new Vue({
    el: "#app",
    router,
    template: ` 
    <div class="container">
        <nav-bar></nav-bar>
        <router-view></router-view>
        <foot></foot>
    </div>
    `,
    components: {
        'nav-bar': Navbar,
        'foot': Footer
    }
});