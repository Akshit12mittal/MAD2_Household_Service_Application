from .database import *
from .models import *
from flask import current_app as app, jsonify, request
from flask_security import auth_required, roles_required, current_user, hash_password, verify_password
from flask import render_template, send_from_directory
from datetime import datetime
from celery.result import AsyncResult
from .tasks import daily_professional_reminders, monthly_customer_report, csv_report


# HOME PAGE- http://127.0.0.1:5000/
# CUSTOMER REGISTRATION- http://127.0.0.1:5000/api/register/customer
# PROFESSIONAL REGISTRATION- http://127.0.0.1:5000/api/register/professional
# Login- http://127.0.0.1:5000/api/login
# Logout- http://127.0.0.1:5000/api/logout
## ADMIN- http://127.0.0.1:5000/api/admin/dashboard
# Admin Dashboard- http://127.0.0.1:5000/api/admin/dashboard
# Users List- http://127.0.0.1:5000/api/admin/users
# Block User- http://127.0.0.1:5000/api/admin/users/<int:user_id>/block
# Unblock User- http://127.0.0.1:5000/api/admin/users/<int:user_id>/unblock
# Getting Service Professional- http://127.0.0.1:5000/api/admin/professionals
# Approve Professional- http://127.0.0.1:5000/api/admin/professionals/<int:pro_id>/approve
# Block Professional- http://127.0.0.1:5000/api/admin/professionals/<int:pro_id>/reject
## Service Management APIs- http://127.0.0.1:5000/api/service
# Serivce Creation- http://127.0.0.1:5000/api/service
# Service Update- http://127.0.0.1:5000/api/services/<int:service_id>
# Service Delete- http://127.0.0.1:5000/api/services/<int:service_id>
# Service Search- http://127.0.0.1:5000/api/services/search
## Customer APIs- http://127.0.0.1:5000/api/customer/dashboard
# Customer Dashboard- http://127.0.0.1:5000/api/customer/dashboard
# Update Customer Profile- http://127.0.0.1:5000/api/customer/profile
# Creating Service Request- http://127.0.0.1:5000/api/customer/service-requests
# Add Review to Service Request- http://127.0.0.1:5000/api/customer/service-requests/<int:request_id>/review
## Professional APIs- http://127.0.0.1:5000/api/professional/dashboard
# Professional Dashboard- http://127.0.0.1:5000/api/professional/dashboard
# Update Professional Profile- http://127.0.0.1:5000/api/professional/profile
# Get Assigned Requests- http://127.0.0.1:5000/api/professional/service-requests
# Accept Service Request- http://127.0.0.1:5000/api/professional/service-requests/<int:request_id>/accept
# Reject Service Request- http://127.0.0.1:5000/api/professional/service-requests/<int:request_id>/reject
# Mark Service Request as Completed- http://127.0.0.1:5000/api/professional/service-requests/<int:request_id>/complete
# Add Remarks to Service Request- http://127.0.0.1:5000/api/professional/service-requests/<int:request_id>/remarks
## Service Request APIs- http://127.0.0.1:5000/api/service-requests
# Get Service Request Details- http://127.0.0.1:5000/api/service-requests/<int:request_id>
# Update Service Request- http://127.0.0.1:5000/api/service-requests/<int:request_id>
# Search Service Requests- http://127.0.0.1:5000/api/service-requests/search
# Delete Service Request- http://127.0.0.1:5000/api/service-requests/<int:request_id>



# Authentcaton APIs
@app.route('/home', methods=['GET'])
def home():
    return "<h1>Home Page</h1>"


# CUSTOMER REGISTRATION
@app.route('/api/register/customer', methods=['POST'])
def register_customer():
    data = request.get_json()
    required_fields = ['username', 'email', 'password', 'phone', 'name', 'address', 'pincode']
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400
    if app.security.datastore.find_user(email=data['email']):
        return jsonify({"message": "User already exists"}), 400
    try:
        user = app.security.datastore.create_user(
            email=data['email'],
            username=data['username'],
            password=hash_password(data['password']),
            roles=['customer'],
            phone=data['phone'],
            active=True
        )
        customer = Customer(
            bearer=user,
            name=data['name'],
            address=data['address'],
            pincode=data['pincode']
        )
        db.session.add(customer)
        db.session.commit()
        return jsonify({"message": "Customer registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500


# PROFESSIONAL REGISTRATION
@app.route('/api/register/professional', methods=['POST'])
def register_professional():
    data = request.get_json()
    required_fields = ['username', 'email', 'password', 'phone', 'name', 'description', 'experience', 'service_id']
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400
    if app.security.datastore.find_user(email=data['email']):
        return jsonify({"message": "User already exists"}), 400
    service=Service.query.get(data['service_id'])
    if not service:
        return jsonify({"message": "Service does not exist"}), 400
    try:
        user = app.security.datastore.create_user(
            email=data['email'],
            username=data['username'],
            password=hash_password(data['password']),
            roles=['professional'],
            phone=data['phone'],
            active=True
        )
        professional = Professional(
            bearer=user,
            name=data['name'],
            description=data['description'],
            experience=data['experience'],
            service_id=data['service_id']
        )
        db.session.add(professional)
        db.session.commit()
        return jsonify({"message": "Professional registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500


# Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    required_fields = ['email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing email or password"}), 400
    user = User.query.filter_by(email=data['email']).first()
    if not user or not verify_password(data['password'], user.password):
        return jsonify({"message": "Invalid email or password"}), 401
    if not user.active:
        return jsonify({"message": "Account is disabled. Please contact admin."}), 403
    token = user.get_auth_token()
    roles = [role.name for role in user.roles]
    response = {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "roles": roles
        }
    }
    if 'customer' in roles and hasattr(user, 'customer'):
        customer = Customer.query.filter_by(user_id=user.id).first()
        if customer:
            response["user"]["customer_id"] = customer.id
            response["user"]["name"] = customer.name
    
    if 'professional' in roles and hasattr(user, 'professional'):
        professional = Professional.query.filter_by(user_id=user.id).first()
        if professional:
            response["user"]["professional_id"] = professional.id
            response["user"]["name"] = professional.name
            response["user"]["is_approved"] = professional.is_approved
    
    return jsonify(response), 200


# Logout
@app.route('/api/logout', methods=['POST'])
@auth_required('token')
def logout():
    try:
        return jsonify({"message": "User logged out successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Logout failed: {str(e)}"}), 500


## ADMIN
# Admin Dashboard
@app.route('/api/admin/dashboard', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def admin_dashboard():
    try:
        total_customers = Customer.query.count()
        total_professionals = Professional.query.count()
        total_users = total_customers + total_professionals
        total_services = Service.query.count()
        total_service_requests = ServiceRequest.query.count()
        a=ServiceRequest.query.order_by(ServiceRequest.date_of_request.desc()).limit(5)
        b=Professional.query.order_by(Professional.date_created.desc()).limit(5)
        print(a)
        print(b)
        response = {
            "summary": {
                "total_users": total_users,
                "total_customers": total_customers,
                "total_professionals": total_professionals,
                "total_services": total_services,
                "total_service_requests": total_service_requests
            },
            "details": {
                "recent_service_requests": [
                    {
                        "id": req.id if req.id else None,
                        "service_name": req.service.name if req.service else None,
                        "customer_name": req.customer.name if req.customer else None,
                        "professional_name": req.professional.name if req.professional else None,
                        "status": req.service_status if req.service_status else None,
                    }
                    for req in ServiceRequest.query.order_by(ServiceRequest.date_of_request.desc()).limit(5)
                ],
                "recent_professionals": [
                    {
                        "id": prof.id if prof.id else None,
                        "name": prof.name if prof.name else None,
                        "service_name": prof.service.name if prof.service else None,
                        "is_approved": prof.is_approved if prof.is_approved else None
                    }
                    for prof in Professional.query.order_by(Professional.date_created.desc()).limit(5)
                ]
            }
        }
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"message": f"Failed to fetch dashboard data: {str(e)}"}), 500


# Users List
@app.route('/api/admin/users', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_users():
    try:
        users = User.query.all()
        response = []
        for user in users:
            user_data = {
                "id": user.id,
                "username": user.username if user.username else None,
                "email": user.email if user.email else None,
                "phone": user.phone if user.phone else None,
                "roles": [role.name for role in user.roles],
                "active": user.active
            }
            if hasattr(user, 'customer') and user.customer:
                user_data["customer"] = {
                    "id": user.customer.id,
                    "name": user.customer.name,
                    "address": user.customer.address,
                    "pincode": user.customer.pincode
                }
            if hasattr(user, 'professional') and user.professional:
                user_data["professional"] = {
                    "id": user.professional.id,
                    "name": user.professional.name,
                    "service_id": user.professional.service_id,
                    "is_approved": user.professional.is_approved,
                    "is_blocked": user.professional.is_blocked
                }
            response.append(user_data)
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"message": f"Failed to fetch users: {str(e)}"}), 500


# Block User
@app.route('/api/admin/users/<int:user_id>/block', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def block_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        user.active = False
        db.session.commit()
        return jsonify({"message": f"User {user.username} has been blocked successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to block user: {str(e)}"}), 500


# Unblock User
@app.route('/api/admin/users/<int:user_id>/unblock', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def unblock_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        # Unblock the user
        user.active = True
        db.session.commit()
        
        return jsonify({"message": f"User {user.username} has been unblocked successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to unblock user: {str(e)}"}), 500


# Getting Service Professional
@app.route('/api/admin/professionals', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_professionals():
    try:
        professionals = Professional.query.all()
        response = [
            {
                "id": prof.id if prof.id else None,
                "name": prof.name if prof.name else None,
                "description": prof.description if prof.description else None,
                "experience": prof.experience if prof.experience else None,
                "service_id": prof.service_id if prof.service_id else None,
                "service_name": prof.service.name if prof.service else None,
                "is_approved": prof.is_approved if prof.is_approved else None,
                "is_blocked": prof.is_blocked if prof.is_blocked else None,
            }
            for prof in professionals
        ]
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"message": f"Failed to fetch professionals: {str(e)}"}), 500


# Approve Professional
@app.route('/api/admin/professionals/<int:pro_id>/approve', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def approve_professional(pro_id):
    try:
        professional = Professional.query.get(pro_id)
        if not professional:
            return jsonify({"message": "Professional not found"}), 404
        
        professional.is_approved = True
        db.session.commit()
        
        return jsonify({"message": f"Professional {professional.name} approved successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to approve professional: {str(e)}"}), 500


# Block Professional
@app.route('/api/admin/professionals/<int:pro_id>/reject', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def reject_professional(pro_id):
    try:
        professional = Professional.query.get(pro_id)
        if not professional:
            return jsonify({"message": "Professional not found"}), 404
        
        professional.is_approved = False
        db.session.commit()
        
        return jsonify({"message": f"Professional {professional.name} rejected successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to reject professional: {str(e)}"}), 500


## Service Management APIs
@app.route('/api/services', methods=['GET'])
def get_services():
    try:
        services = Service.query.all()
        return jsonify([{
            "id": service.id if service.id else None,
            "name": service.name if service.name else None,
            "description": service.description if service.description else None,
            "price": service.price if service.price else None,
            "time_required": service.time_required if service.time_required else None,
            "date_created": service.date_created if service.date_created else None
        } for service in services]), 200
    except Exception as e:
        return jsonify({"message": f"Failed to fetch services: {str(e)}"}), 500

# Serivce Creation
@app.route('/api/service', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def create_service():
    data= request.get_json()
    required_fields=['name', 'description','price','time_required']
    if not all(fields in data for fields in required_fields):
        return jsonify({"message": "Missing required fields"}), 400
    try:
        service= Service(
            name=data['name'],
            description=data['description'],
            price=data['price'],
            time_required=data['time_required']
        )
        db.session.add(service)
        db.session.commit()
        return jsonify({"message": "Service created successfully",
                        "service_id":service.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Service creation failed: {str(e)}"}), 500
    

# Service Update
@app.route('/api/services/<int:service_id>', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def update_service(service_id):
    data = request.get_json()
    required_fields = ['name', 'description', 'price', 'time_required']
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"message": "Service not found"}), 404
    try:
        service.name = data['name']
        service.description = data['description']
        service.price = data['price']
        service.time_required = data['time_required']
        db.session.commit()
        
        return jsonify({
            "message": "Service updated successfully",
            "service_id": service.id,
            "updated_service": {
                "name": service.name,
                "description": service.description,
                "price": service.price,
                "time_required": service.time_required
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Service update failed: {str(e)}"}), 500
    

# Service Delete
@app.route('/api/services/<int:service_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def delete_service(service_id):
    try:
        service = Service.query.get(service_id)
        if not service:
            return jsonify({"message": "Service not found"}), 404
        db.session.delete(service)
        db.session.commit()
        return jsonify({"message": f"Service {service.name} deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to delete service: {str(e)}"}), 500


# Service Search
@app.route('/api/services/search', methods=['GET'])
@auth_required('token')
def search_services():
    query = request.args.get('q', '').strip().lower()
    if not query:
        return jsonify({"message": "Search query is required"}), 400
    try:
        services = Service.query.filter(Service.name.ilike(f"%{query}%")).all()
        
        response = [
            {
                "id": service.id,
                "name": service.name,
                "description": service.description,
                "price": service.price,
                "time_required": service.time_required,
                "date_created": service.date_created
            }
            for service in services
        ]
        if not response:
            return jsonify({"message": "No services found matching the query"}), 404
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"message": f"Failed to search services: {str(e)}"}), 500

# Customer APIs
# Customer Dashboard
@app.route('/api/customer/dashboard', methods=['GET'])
@auth_required('token')
@roles_required('customer')
def customer_dashboard():
    try:
        customer = Customer.query.filter_by(user_id=current_user.id).first()
        if not customer:
            return jsonify({"message": "Customer profile not found"}), 404
        service_requests = ServiceRequest.query.filter_by(customer_id=customer.id).all()
        requests_data = [
            {
                "id": req.id if req.id else None,
                "service_name": req.service.name if req.service else None,
                "professional_name": req.professional.name if req.professional else None,
                "status": req.service_status if req.service_status else None,
                "date_of_request": req.date_of_request if req.date_of_request else None,
                "date_of_completion": req.date_of_completion,
                "remarks": req.remarks if req.remarks else None
            }
            for req in service_requests
        ]
        response = {
            "customer_id": customer.id,
            "name": customer.name,
            "total_service_requests": len(service_requests),
            "service_requests": requests_data
        }
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"message": f"Failed to fetch dashboard data: {str(e)}"}), 500


# Update Customer Profile
@app.route('/api/customer/profile', methods=['GET', 'PUT'])
@auth_required('token')
@roles_required('customer')
def customer_profile():
    try:
        customer = Customer.query.filter_by(user_id=current_user.id).first()
        if not customer:
            return jsonify({"message": "Customer profile not found"}), 404
        if request.method == 'GET':
            response = {
                "id": customer.id,
                "name": customer.name,
                "address": customer.address,
                "pincode": customer.pincode,
                "date_created": customer.date_created
            }
            return jsonify(response), 200
        elif request.method == 'PUT':
            data = request.get_json()
            if 'name' in data:
                customer.name = data['name']
            if 'address' in data:
                customer.address = data['address']
            if 'pincode' in data:
                customer.pincode = data['pincode']
            db.session.commit()
            return jsonify({"message": "Customer profile updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to update profile: {str(e)}"}), 500


# Creating Service Request
@app.route('/api/customer/service-requests', methods=['GET', 'POST'])
@auth_required('token')
@roles_required('customer')
def customer_service_requests():
    if request.method == 'GET':
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return jsonify({"message": "Customer profile not found"}), 404
            service_requests = ServiceRequest.query.filter_by(customer_id=customer.id).all()
            response = [
                {
                    "id": req.id,
                    "service_name": req.service.name if req.service else None,
                    "professional_name": req.professional.name if req.professional else None,
                    "status": req.service_status if req.service_status else None,
                    "date_of_request": req.date_of_request if req.date_of_request else None,
                    "date_of_completion": req.date_of_completion,
                    "remarks": req.remarks
                }
                for req in service_requests
            ]
            return jsonify(response), 200
        except Exception as e:
            return jsonify({"message": f"Failed to fetch service requests: {str(e)}"}), 500
    elif request.method == 'POST':
        try:
            data = request.get_json()
            required_fields = ['service_id', 'date_of_request']
            if not all(field in data for field in required_fields):
                return jsonify({"message": "Missing required fields"}), 400
            service = Service.query.get(data['service_id'])
            if not service:
                return jsonify({"message": "Service not found"}), 404
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return jsonify({"message": "Customer profile not found"}), 404
            try:
                date_of_request = datetime.fromisoformat(data['date_of_request'])
            except ValueError:
                return jsonify({"message": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400
            new_request = ServiceRequest(
                service_id=data['service_id'],
                customer_id=customer.id,
                date_of_request=date_of_request,
                service_status='requested'
            )
            db.session.add(new_request)
            db.session.commit()
            return jsonify({"message": "Service request created successfully", "request_id": new_request.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": f"Failed to create service request: {str(e)}"}), 500


@app.route('/api/customer/service-requests/<int:request_id>', methods=['GET', 'PUT'])
@auth_required('token')
@roles_required('customer')
def manage_service_request(request_id):
    try:
        service_request = ServiceRequest.query.get(request_id)
        if not service_request:
            return jsonify({"message": "Service request not found"}), 404
        if request.method == 'GET':
            response = {
                "id": service_request.id,
                "service_name": service_request.service.name,
                "professional_name": service_request.professional.name if service_request.professional else None,
                "status": service_request.service_status,
                "date_of_request": service_request.date_of_request,
                "date_of_completion": service_request.date_of_completion,
                "remarks": service_request.remarks
            }
            return jsonify(response), 200
        elif request.method == 'PUT':
            data = request.get_json()            
            if 'service_status' in data and data['service_status'] == 'closed':
                service_request.service_status = 'closed'
                service_request.date_of_completion = datetime.utcnow()
            if 'remarks' in data:
                service_request.remarks = data['remarks']
            db.session.commit()
            return jsonify({"message": f"Service request {service_request.id} updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to manage service request: {str(e)}"}), 500


# Add Review to Service Request
@app.route('/api/customer/service-requests/<int:request_id>/review', methods=['POST'])
@auth_required('token')
@roles_required('customer')
def add_review(request_id):
    try:
        service_request = ServiceRequest.query.get(request_id)
        if not service_request or service_request.service_status != 'closed':
            return jsonify({"message": "Service request must be closed to add a review"}), 400
        data = request.get_json()
        if 'rating' not in data or 'review' not in data:
            return jsonify({"message": "Rating and review are required"}), 400
        service_request.rating = data['rating']
        service_request.review = data['review']        
        db.session.commit()
        return jsonify({"message": f"Review added successfully for Service Request {service_request.id}"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to add review: {str(e)}"}), 500


# Professional APIs
# Professional Dashboard
@app.route('/api/professional/dashboard', methods=['GET'])
@auth_required('token')
@roles_required('professional')
def professional_dashboard():
    try:
        professional = Professional.query.filter_by(user_id=current_user.id).first()
        if not professional:
            return jsonify({"message": "Professional profile not found"}), 404
        assigned_requests = ServiceRequest.query.filter_by(professional_id=professional.id, service_status='assigned').all()
        assigned_requests_data = [
            {
                "id": req.id,
                "service_name": req.service.name,
                "customer_name": req.customer.name,
                "status": req.service_status,
                "date_of_request": req.date_of_request,
                "remarks": req.remarks
            }
            for req in assigned_requests
        ]
        closed_requests = ServiceRequest.query.filter_by(professional_id=professional.id, service_status='closed').all()
        closed_requests_data = [
            {
                "id": req.id,
                "service_name": req.service.name,
                "customer_name": req.customer.name,
                "status": req.service_status,
                "date_of_request": req.date_of_request,
                "date_of_completion": req.date_of_completion,
                "remarks": req.remarks
            }
            for req in closed_requests
        ]
        response = {
            "professional_id": professional.id,
            "name": professional.name,
            "total_assigned_requests": len(assigned_requests),
            "total_closed_requests": len(closed_requests),
            "assigned_requests": assigned_requests_data,
            "closed_requests": closed_requests_data
        }
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"message": f"Failed to fetch dashboard data: {str(e)}"}), 500


# Update Professional Profile
@app.route('/api/professional/profile', methods=['GET', 'PUT'])
@auth_required('token')
@roles_required('professional')
def professional_profile():
    try:
        # Get the current user's professional profile
        professional = Professional.query.filter_by(user_id=current_user.id).first()
        if not professional:
            return jsonify({"message": "Professional profile not found"}), 404

        if request.method == 'GET':
            # Return professional profile details
            response = {
                "id": professional.id,
                "name": professional.name,
                "description": professional.description,
                "experience": professional.experience,
                "service_id": professional.service_id,
                "service_name": professional.service.name if professional.service else None,
                "is_approved": professional.is_approved,
                "is_blocked": professional.is_blocked,
                "date_created": professional.date_created
            }
            return jsonify(response), 200

        elif request.method == 'PUT':
            # Update professional profile details
            data = request.get_json()
            if 'name' in data:
                professional.name = data['name']
            if 'description' in data:
                professional.description = data['description']
            if 'experience' in data:
                professional.experience = data['experience']

            db.session.commit()
            return jsonify({"message": "Professional profile updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to update profile: {str(e)}"}), 500


# Get Assigned Requests
@app.route('/api/professional/service-requests', methods=['GET'])
@auth_required('token')
@roles_required('professional')
def get_assigned_service_requests():
    try:
        professional = Professional.query.filter_by(user_id=current_user.id).first()
        print(professional.id)
        if not professional:
            return jsonify({"message": "Professional profile not found"}), 404
        service_requests = ServiceRequest.query.filter_by(service_id=professional.service_id).all()
        print(service_requests)
        response = [
            {
                "id": req.id if req.id else None,
                "service_name": req.service.name if req.service else None,
                "customer_name": req.customer.name if req.customer else None,
                "status": req.service_status if req.service_status else None,
                "date_of_request": req.date_of_request if req.date_of_request else None,
                "remarks": req.remarks if req.remarks else None
            }
            for req in service_requests
        ]
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"message": f"Failed to fetch service requests: {str(e)}"}), 500


# Accept Service Request
@app.route('/api/professional/service-requests/<int:request_id>/accept', methods=['PUT'])
@auth_required('token')
@roles_required('professional')
def accept_service_request(request_id):
    try:
        service_request = ServiceRequest.query.get(request_id)
        if not service_request or service_request.service_status != 'requested':
            return jsonify({"message": "Service request not found or already accepted"}), 404
        professional = Professional.query.filter_by(user_id=current_user.id).first()
        if not professional:
            return jsonify({"message": "Professional profile not found"}), 404
        service_request.professional_id = professional.id
        service_request.service_status = 'assigned'
        db.session.commit()
        return jsonify({"message": f"Service request {service_request.id} accepted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to accept service request: {str(e)}"}), 500


# Reject Service Request
@app.route('/api/professional/service-requests/<int:request_id>/reject', methods=['PUT'])
@auth_required('token')
@roles_required('professional')
def reject_service_request(request_id):
    try:
        service_request = ServiceRequest.query.get(request_id)
        if not service_request or service_request.service_status != 'requested':
            return jsonify({"message": "Service request not found or already processed"}), 404
        service_request.service_status = 'rejected'
        db.session.commit()
        return jsonify({"message": f"Service request {service_request.id} rejected successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to reject service request: {str(e)}"}), 500


# Mark Service Request as Completed
@app.route('/api/professional/service-requests/<int:request_id>/complete', methods=['PUT'])
@auth_required('token')
@roles_required('professional')
def complete_service_request(request_id):
    try:
        service_request = ServiceRequest.query.get(request_id)
        if not service_request or service_request.service_status != 'assigned':
            return jsonify({"message": "Service request not found or not assigned"}), 404
        service_request.service_status = 'closed'
        service_request.date_of_completion = datetime.utcnow()
        db.session.commit()
        return jsonify({"message": f"Service request {service_request.id} marked as completed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to complete service request: {str(e)}"}), 500


# Add Remarks to Service Request
@app.route('/api/professional/service-requests/<int:request_id>/remarks', methods=['PUT'])
@auth_required('token')
@roles_required('professional')
def add_remarks_to_service_request(request_id):
    try:
        service_request = ServiceRequest.query.get(request_id)
        if not service_request:
            return jsonify({"message": "Service request not found"}), 404
        professional = Professional.query.filter_by(user_id=current_user.id).first()
        if not professional or service_request.professional_id != professional.id:
            return jsonify({"message": "You are not authorized to add remarks for this service request"}), 403
        if service_request.service_status not in ['assigned', 'closed']:
            return jsonify({"message": "Remarks can only be added to assigned or completed service requests"}), 400
        data = request.get_json()
        if 'remarks' not in data:
            return jsonify({"message": "Remarks field is required"}), 400
        service_request.remarks = data['remarks']
        db.session.commit()
        return jsonify({"message": f"Remarks added successfully for Service Request {service_request.id}"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to add remarks: {str(e)}"}), 500


# Service Request APIs
# Get Service Requests
@app.route('/api/service-requests', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_service_requests():
    try:
        service_requests = ServiceRequest.query.all()
        response = [
            {
                "id": req.id,
                "service_name": req.service.name if req.service else None,
                "customer_name": req.customer.name if req.customer else None,
                "professional_name": req.professional.name if req.professional else None,
                "status": req.service_status if req.service_status else None,
                "date_of_request": req.date_of_request if req.date_of_request else None,
                "date_of_completion": req.date_of_completion if req.date_of_completion else None,
                "remarks": req.remarks
            }
            for req in service_requests
        ]
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"message": f"Failed to fetch service requests: {str(e)}"}), 500


# Details of Specific Service Request
@app.route('/api/service-requests/<int:request_id>', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_service_request(request_id):
    try:
        service_request = ServiceRequest.query.get(request_id)
        if not service_request:
            return jsonify({"message": "Service request not found"}), 404
        response = {
            "id": service_request.id,
            "service_name": service_request.service.name,
            "customer_name": service_request.customer.name,
            "professional_name": service_request.professional.name if service_request.professional else None,
            "status": service_request.service_status,
            "date_of_request": service_request.date_of_request,
            "date_of_completion": service_request.date_of_completion,
            "remarks": service_request.remarks
        }
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"message": f"Failed to fetch service request: {str(e)}"}), 500


# Search Service Requests
@app.route('/api/service-requests/search', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def search_service_requests():
    try:
        status = request.args.get('status', '').strip().lower()
        customer_name = request.args.get('customer_name', '').strip().lower()
        professional_name = request.args.get('professional_name', '').strip().lower()
        query = ServiceRequest.query.join(Customer).join(Professional, isouter=True)
        if status:
            query = query.filter(ServiceRequest.service_status.ilike(f"%{status}%"))
        if customer_name:
            query = query.filter(Customer.name.ilike(f"%{customer_name}%"))
        if professional_name:
            query = query.filter(Professional.name.ilike(f"%{professional_name}%"))
        service_requests = query.all()
        response = [
            {
                "id": req.id,
                "service_name": req.service.name,
                "customer_name": req.customer.name,
                "professional_name": req.professional.name if req.professional else None,
                "status": req.service_status,
                "date_of_request": req.date_of_request,
                "date_of_completion": req.date_of_completion,
                "remarks": req.remarks
            }
            for req in service_requests
        ]
        if not response:
            return jsonify({"message": "No matching service requests found"}), 404
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"message": f"Failed to search service requests: {str(e)}"}), 500


# Delete Service Request
@app.route('/api/service-requests/<int:request_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def delete_service_request(request_id):
    try:
        service_request = ServiceRequest.query.get(request_id)
        if not service_request:
            return jsonify({"message": "Service request not found"}), 404
        db.session.delete(service_request)
        db.session.commit()
        return jsonify({"message": f"Service request {service_request.id} deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to delete service request: {str(e)}"}), 500
    

# Export Service Requests as CSV (Admin triggered)
@app.route('/api/export', methods=['GET'])
# @auth_required('token')
# @roles_required('admin')
def export_service_requests():
    try:        
        result = csv_report.delay()
        return jsonify({
            "message": "CSV export started successfully",
            "task_id": result.id
        }), 200
    except Exception as e:
        return jsonify({"message": f"Failed to start export: {str(e)}"}), 500


@app.route('/api/csv_result/<task_id>', methods=['GET'])
# @auth_required('token')
# @roles_required('admin')
def csv_result(task_id):
    try:
        result = AsyncResult(task_id)
        if result.ready():
            if result.successful():
                filename = result.get()
                # Make sure the path is correct - adjust if needed
                return send_from_directory('Frontend/static', filename, as_attachment=True)
            else:
                return jsonify({
                    "status": "Failed", 
                    "error": str(result.result)
                }), 500
        else:
            return jsonify({
                "status": "Processing", 
                "task_id": task_id
            }), 202
    except Exception as e:
        return jsonify({"message": f"Error checking task status: {str(e)}"}), 500



@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # Only handle non-API routes with the catch-all
    if path.startswith('api/'):
        return {"error": "Not found"}, 404
    return render_template("index.html")