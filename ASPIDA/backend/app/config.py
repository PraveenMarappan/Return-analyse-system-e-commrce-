import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

# Detect serverless environment (Vercel / AWS Lambda)
IS_VERCEL = 'VERCEL' in os.environ or os.environ.get('AWS_LAMBDA_FUNCTION_NAME')
WRITABLE_DIR = '/tmp' if IS_VERCEL else BASE_DIR

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'aspida-secret-key-change-in-production')
    
    default_db_path = os.path.join(WRITABLE_DIR, 'aspida.db') if IS_VERCEL else os.path.join(BASE_DIR, 'instance', 'aspida.db')
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    
    SQLALCHEMY_DATABASE_URI = db_url if db_url else f'sqlite:///{default_db_path}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', os.environ.get('SECRET_KEY', 'aspida-jwt-secret-key-super-secure'))
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    UPLOAD_FOLDER = os.path.join(WRITABLE_DIR, 'uploads')
    REPORT_FOLDER = os.path.join(WRITABLE_DIR, 'reports')
    MODEL_FOLDER = os.path.join(BASE_DIR, 'app', 'ml', 'models')
    
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
    
    LLM_API_KEY = os.environ.get('LLM_API_KEY', None)
