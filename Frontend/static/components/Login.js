const Login = {
    template: `
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card shadow" style="background: linear-gradient(90deg, #00913f 0%, #c8e717 100%);">
                    <div class="card-body p-5">
                        <h2 class="text-center text-white mb-4">Login</h2>
                        <div class="form-floating mb-3">
                            <input type="email" class="form-control" id="email" v-model="formdata.email" placeholder="Email" required>
                            <label for="email">Email Address</label>
                        </div>
                        <div class="form-floating mb-4">
                            <input type="password" class="form-control" id="password" v-model="formdata.password" placeholder="Password" required>
                            <label for="password">Password</label>
                        </div>
                        <div class="d-grid">
                            <button class="btn btn-light btn-lg" @click="loginuser">Login</button>
                        </div>
                        <div class="text-center mt-3">
                            <p class="text-white">Don't have an account? 
                                <router-link to="/customer-register" class="text-white fw-bold">Register as Customer</router-link> or
                                <router-link to="/professional-register" class="text-white fw-bold">Register as Professional</router-link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function(){
        return{
            formdata:{
                email: "",
                password: ""
            }
        }
    },
    methods:{
        loginuser: function(){
            fetch('/api/login', {
                method: 'POST',
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.formdata)
            })
            .then(response => {
                console.log("Response status:", response.status);
                return response.json();
            })
            .then(data => {
                console.log("Response data:", data);
                if(data.message === "Login successful" && data.token){
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userRoles", JSON.stringify(data.user.roles));
                    localStorage.setItem("username", data.user.username);
                    localStorage.setItem("email", data.user.email);
                    
                    
                    // Redirect based on role
                    if(data.user.roles.includes('admin')){
                        this.$router.push("/admin/dashboard");
                    } else if(data.user.roles.includes('professional')){
                        this.$router.push("/professional/dashboard");
                    } else if(data.user.roles.includes('customer')){
                        this.$router.push("/customer/dashboard");
                    } else {
                        this.$router.push("/");
                    }
                }
                else{
                    alert("Login failed: " + (data.message || "Unknown error"));
                }
            })
            
            .catch(error => {
                console.error("Login error:", error);
                alert("Login failed: " + error.message);
            });
        }
    }
}
