import sys
import os

# Add backend folder to path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app as application

# Entry point for Vercel Serverless Function
app = application
