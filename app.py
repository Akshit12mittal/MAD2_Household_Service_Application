from flask import Flask
from Backend.database import db
from Backend.models import *
from Backend.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore
from flask_security import hash_password
from flask_security import login_user
from Backend.celery_init import celery_init_app
from celery.schedules import crontab

def create_app():
    app = Flask(__name__,template_folder='Frontend',static_folder='Frontend/static')
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    return app

app = create_app()
celery = celery_init_app(app)
celery.autodiscover_tasks()


with app.app_context():
    db.create_all()

    app.security.datastore.find_or_create_role(name='admin', description='Administrator')
    app.security.datastore.find_or_create_role(name='customer', description='Customer')
    app.security.datastore.find_or_create_role(name='professional', description='Service Professional')

    db.session.commit()

    if not app.security.datastore.find_user(email= "admin@gmail.com"):
        app.security.datastore.create_user(
            email="admin@gmail.com",
            username= "Akshit",
            password= hash_password("Pass@123"),
            roles=['admin'],
            phone="1234567890",
            active=True)
        db.session.commit()
        

from Backend.routes import *

@celery.on_after_finalize.connect 
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute = '*/2'),
        daily_professional_reminders.s(),
        name="Daily Reminder"
    )

    sender.add_periodic_task(
        crontab(minute = '*/2'),
        monthly_customer_report.s(),
        name="Monthly Reminder" 
    )
if __name__ == '__main__':
    # run the app on localhost:5000
    app.run(host='localhost', port=5000, debug=True)