class Config():
    DEBUG= False
    SQLALCHEMY_TRACK_MODIFICATIONS = True

class LocalDevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///hhsa.sqlite3'

    # Config for security
    SECRET_KEY= "this is my secret key" # hash user credentials in session
    SECURITY_PASSWORD_HASH= "bcrypt" #mechanism to hash password
    SECURITY_PASSWORD_SALT= "this is my salt" #helps in hashing in password
    WTF_CSRF_ENABLED= False #cross site request forgery protection
    SECURITY_TOKEN_AUTHENTICATION_HEADER= 'Authorization' #header for token
    SECURITY_TOKEN_MAX_AGE= 3600