from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)    
    password = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    active = db.Column(db.Boolean, nullable=False)
    phone = db.Column(db.String, nullable=False)
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False)
    roles = db.relationship('Role', backref='bearer', secondary='user_roles')
    customer = db.relationship('Customer', backref='bearer', uselist=False)
    professional = db.relationship('Professional', backref='bearer', uselist=False)

class Role(db.Model, RoleMixin):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.String)

# many to many relationship
class UserRoles(db.Model):
    __tablename__ = 'user_roles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))

class Customer(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    pincode = db.Column(db.String, nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    service_requests = db.relationship('ServiceRequest', backref='customer')


class Professional(db.Model):
    __tablename__ = 'professionals'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'))
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.Text, nullable=False)
    experience = db.Column(db.Integer)
    is_approved = db.Column(db.Boolean, default=False)
    is_blocked = db.Column(db.Boolean, default=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    service_requests = db.relationship('ServiceRequest', backref='professional')


class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.String, nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    professionals = db.relationship('Professional', backref='service')
    service_requests = db.relationship('ServiceRequest', backref='service')

class ServiceRequest(db.Model):
    __tablename__ = 'service_requests'
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'))
    professional_id = db.Column(db.Integer, db.ForeignKey('professionals.id'), nullable=True)
    date_of_request = db.Column(db.DateTime, nullable=False)
    date_of_completion = db.Column(db.DateTime, nullable=True)
    service_status = db.Column(db.String, default='requested')  # requested/assigned/closed
    remarks = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Integer, nullable=True)
    review = db.Column(db.Text, nullable=True)
