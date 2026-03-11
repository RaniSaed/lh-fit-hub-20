import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'lh-fit-hub-super-secret-key-2024'
    # Use pg8000 (pure Python) driver — works on Python 3.14, no C extensions needed
    _db_url = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'app.db')
    # Render provides 'postgres://' or 'postgresql://' — force pg8000 dialect
    _db_url = _db_url.replace('postgres://', 'postgresql+pg8000://', 1)
    _db_url = _db_url.replace('postgresql://', 'postgresql+pg8000://', 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-super-secure-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 1 day

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
