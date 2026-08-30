import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app, db
from app.models import User

def run_tests():
    app = create_app()
    client = app.test_client()

    print("==================================================")
    print("RUNNING ASPIDA AUTHENTICATION SYSTEM TESTS")
    print("==================================================")

    # 1. Health Check Test
    res = client.get('/api/health')
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    assert res.json.get('success') is True
    print("[OK] 1. Health check (GET /api/health) PASSED")

    # 2. Valid Admin Login Test
    res = client.post('/api/auth/login', json={
        "email": "admin@aspida.com",
        "password": "admin123"
    })
    assert res.status_code == 200, f"Admin login failed: {res.status_code} - {res.data}"
    data = res.json
    assert data.get('success') is True
    assert 'token' in data
    assert data['user']['role'] == 'admin'
    admin_token = data['token']
    print("[OK] 2. Admin login (admin@aspida.com / admin123) PASSED")

    # 3. Valid Manager Login Test
    res = client.post('/api/auth/login', json={
        "email": "manager@aspida.com",
        "password": "manager123"
    })
    assert res.status_code == 200
    data = res.json
    assert data['user']['role'] == 'manager'
    manager_token = data['token']
    print("[OK] 3. Manager login (manager@aspida.com / manager123) PASSED")

    # 4. Valid Analyst Login Test
    res = client.post('/api/auth/login', json={
        "email": "analyst@aspida.com",
        "password": "analyst123"
    })
    assert res.status_code == 200
    data = res.json
    assert data['user']['role'] == 'analyst'
    print("[OK] 4. Analyst login (analyst@aspida.com / analyst123) PASSED")

    # 5. Case Sensitivity & Trim Test
    res = client.post('/api/auth/login', json={
        "email": " ADMIN@ASPIDA.COM ",
        "password": "admin123"
    })
    assert res.status_code == 200
    assert res.json.get('success') is True
    print("[OK] 5. Email normalization (ADMIN@ASPIDA.COM + trim) PASSED")

    # 6. Invalid Password Test
    res = client.post('/api/auth/login', json={
        "email": "admin@aspida.com",
        "password": "wrongpassword"
    })
    assert res.status_code == 401
    assert res.json.get('message') == "Invalid email or password."
    print("[OK] 6. Invalid password rejection PASSED")

    # 7. Session Validation (GET /api/auth/me) Test
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get('/api/auth/me', headers=headers)
    assert res.status_code == 200
    assert res.json.get('user', {}).get('email') == "admin@aspida.com"
    print("[OK] 7. Session validation (GET /api/auth/me) PASSED")

    # 8. Role-based Admin Route Access Test
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    res = client.get('/api/admin/users', headers=headers_admin)
    assert res.status_code == 200
    print("[OK] 8a. Admin user accessing /api/admin/users PASSED")

    headers_manager = {"Authorization": f"Bearer {manager_token}"}
    res = client.get('/api/admin/users', headers=headers_manager)
    assert res.status_code == 403
    print("[OK] 8b. Non-admin user blocked from /api/admin/users PASSED")

    print("\nALL 8 AUTHENTICATION INTEGRATION TESTS PASSED PERFECTLY!\n")

if __name__ == '__main__':
    run_tests()
