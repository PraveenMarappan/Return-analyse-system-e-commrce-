import unittest
from app import create_app, db
from app.models import User

class TestAuthAPI(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()
            u = User(name="Test Manager", email="manager@test.com", role="manager", is_active=True)
            u.set_password("pass1234")
            db.session.add(u)
            db.session.commit()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_login_success(self):
        res = self.client.post('/api/auth/login', json={
            'email': 'manager@test.com',
            'password': 'pass1234'
        })
        data = res.get_json()
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIn('token', data['data'])

    def test_login_failure(self):
        res = self.client.post('/api/auth/login', json={
            'email': 'manager@test.com',
            'password': 'wrongpassword'
        })
        data = res.get_json()
        self.assertEqual(res.status_code, 401)
        self.assertFalse(data['success'])

if __name__ == '__main__':
    unittest.main()
