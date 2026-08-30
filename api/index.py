import sys
import os

# Add ASPIDA backend directory to sys.path
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ASPIDA', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app import create_app

app = create_app()
