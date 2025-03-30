from celery import shared_task
from .models import Professional, ServiceRequest, Customer, Service, User
from .utils import format_report
from .mail import send_email
import datetime
import csv
import requests
import json
from flask import current_app as app

@shared_task(ignore_results=False, name="download_csv_report")
def csv_report():

    service_requests = ServiceRequest.query.all()
    csv_file_name = f"service_requests_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.csv"
    
    with open(f'Frontend/static/{csv_file_name}', 'w', newline="") as csvfile:
        sr_no = 1
        requests_csv = csv.writer(csvfile, delimiter=',')
        requests_csv.writerow([
            'Sr No.', 
            'Service ID', 
            'Service Name',
            'Customer ID', 
            'Customer Name',
            'Professional ID', 
            'Professional Name',
            'Date of Request', 
            'Date of Completion',
            'Status', 
            'Remarks',
            'Rating',
            'Review'
        ])
        
        for req in service_requests:
            this_req = [
                sr_no,
                req.service_id,
                req.service.name if req.service else "Unknown Service",
                req.customer_id,
                req.customer.name if req.customer else "Unknown Customer",
                req.professional_id if req.professional_id else "N/A",
                req.professional.name if req.professional else "Not Assigned",
                req.date_of_request,
                req.date_of_completion if req.date_of_completion else "N/A",
                req.service_status,
                req.remarks if req.remarks else "No remarks",
                req.rating if req.rating else "No rating",
                req.review if req.review else "No review"
            ]
            requests_csv.writerow(this_req)
            sr_no += 1
    
    return csv_file_name

@shared_task(ignore_results=False, name="monthly_customer_report")
def monthly_customer_report():
    """
    Generates and sends monthly activity reports to all customers.
    
    This task retrieves all customers and their service requests,
    generates a report with statistics and details, and sends it
    via email to each customer.
    
    Returns:
        str: Confirmation message that reports were sent.
    """
    customers = Customer.query.all()
    for customer in customers:
        user_data = {}
        user_data['name'] = customer.name
        user_data['email'] = customer.bearer.email
        
        # Get all service requests for this customer
        service_requests = ServiceRequest.query.filter_by(customer_id=customer.id).all()
        
        # Calculate statistics
        total_requests = len(service_requests)
        closed_requests = sum(1 for req in service_requests if req.service_status == 'closed')
        pending_requests = sum(1 for req in service_requests if req.service_status in ['requested', 'assigned'])
        
        # Format service request details
        requests_data = []
        for req in service_requests:
            this_req = {
                "id": req.id,
                "service_name": req.service.name,
                "professional_name": req.professional.name if req.professional else "Not Assigned",
                "status": req.service_status,
                "date_requested": req.date_of_request.strftime("%Y-%m-%d %H:%M") if req.date_of_request else "N/A",
                "date_completed": req.date_of_completion.strftime("%Y-%m-%d %H:%M") if req.date_of_completion else "N/A",
                "remarks": req.remarks or "No remarks"
            }
            requests_data.append(this_req)
        
        user_data['statistics'] = {
            "total_requests": total_requests,
            "closed_requests": closed_requests,
            "pending_requests": pending_requests
        }
        user_data['service_requests'] = requests_data
        
        # Generate HTML report and send email
        message = format_report('Frontend/mail_details.html', user_data)
        send_email(customer.bearer.email, subject="Monthly Activity Report - Rise Home Services", message=message)
    
    return "Monthly reports sent to all customers"

@shared_task(ignore_results=False, name="daily_professional_reminders")
def daily_professional_reminders():
    """
    Sends daily reminders to professionals with pending service requests.
    
    This task checks for professionals who have pending service requests
    and sends them a reminder via Google Chat Webhook.
    
    Returns:
        str: Confirmation message that reminders were sent.
    """
    professionals = Professional.query.filter_by(is_approved=True, is_blocked=False).all()
    reminder_count = 0
    
    for professional in professionals:
        # Check for pending service requests that need attention
        pending_requests = ServiceRequest.query.filter_by(
            service_id=professional.service_id, 
            service_status='requested'
        ).all()
        
        if pending_requests:
            # Send reminder via Google Chat Webhook
            text = f"Hi {professional.name}, you have {len(pending_requests)} pending service requests that need your attention. Please login to accept or reject them: http://127.0.0.1:5000/professional/dashboard"
            response = requests.post(
                "https://chat.googleapis.com/v1/spaces/AAQA93SUInc/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=qxGZIDqdW5uRNPS1kv2tfM2Y1pzN-T0EI5Npb8TWjf0", 
                json={"text": text}
            )
            print(f"Reminder sent to {professional.name} with status code: {response.status_code}")
            reminder_count += 1
    
    return f"Daily reminders sent to {reminder_count} professionals with pending requests"
