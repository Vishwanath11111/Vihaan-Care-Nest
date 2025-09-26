#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Vihaan Care Nest
Tests all endpoints including authentication, packages, location updates, subscriptions, and admin dashboard
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class VihaanCareNestAPITester:
    def __init__(self, base_url="https://babynestcare.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.customer_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            print(f"❌ {name}: FAILED - {details}")
        
        self.test_results.append({
            "test_name": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    token: Optional[str] = None, expected_status: int = 200) -> tuple:
        """Make HTTP request and return success status and response"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}

            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.make_request('GET', '')
        self.log_test("Root API Endpoint", success, 
                     "" if success else f"Response: {response}", response)
        return success

    def test_packages_endpoint(self):
        """Test packages endpoint"""
        success, response = self.make_request('GET', 'packages')
        
        if success:
            # Validate package structure
            if isinstance(response, list) and len(response) == 6:
                # Check if we have 3 baby and 3 mother packages
                baby_packages = [p for p in response if p.get('target') == 'baby']
                mother_packages = [p for p in response if p.get('target') == 'mother']
                
                if len(baby_packages) == 3 and len(mother_packages) == 3:
                    # Check pricing
                    baby_prices = [6000, 10000, 14000]
                    mother_prices = [5000, 9000, 12000]
                    
                    baby_actual_prices = sorted([p['price_per_month'] for p in baby_packages])
                    mother_actual_prices = sorted([p['price_per_month'] for p in mother_packages])
                    
                    if baby_actual_prices == baby_prices and mother_actual_prices == mother_prices:
                        self.log_test("Packages Endpoint", True, "All packages with correct pricing", response)
                        return True
                    else:
                        self.log_test("Packages Endpoint", False, 
                                    f"Incorrect pricing. Baby: {baby_actual_prices}, Mother: {mother_actual_prices}")
                        return False
                else:
                    self.log_test("Packages Endpoint", False, 
                                f"Expected 3 baby and 3 mother packages, got {len(baby_packages)} baby, {len(mother_packages)} mother")
                    return False
            else:
                self.log_test("Packages Endpoint", False, 
                            f"Expected 6 packages, got {len(response) if isinstance(response, list) else 'non-list'}")
                return False
        else:
            self.log_test("Packages Endpoint", False, f"Request failed: {response}")
            return False

    def test_customer_registration(self):
        """Test customer registration"""
        customer_data = {
            "email": "customer@demo.com",
            "password": "password123",
            "full_name": "Demo Customer",
            "phone": "9876543210",
            "role": "customer"
        }
        
        success, response = self.make_request('POST', 'auth/register', customer_data, expected_status=200)
        
        if success:
            # Check if user data is returned correctly
            if (response.get('email') == customer_data['email'] and 
                response.get('full_name') == customer_data['full_name'] and
                response.get('role') == 'customer'):
                self.log_test("Customer Registration", True, "Customer registered successfully", response)
                return True
            else:
                self.log_test("Customer Registration", False, "Invalid response data", response)
                return False
        else:
            # Check if it's a duplicate email error (which is acceptable)
            if isinstance(response, dict) and "already registered" in str(response.get('detail', '')):
                self.log_test("Customer Registration", True, "User already exists (acceptable)", response)
                return True
            else:
                self.log_test("Customer Registration", False, f"Registration failed: {response}")
                return False

    def test_admin_registration(self):
        """Test admin registration"""
        admin_data = {
            "email": "admin@demo.com",
            "password": "password123",
            "full_name": "Demo Admin",
            "phone": "9876543211",
            "role": "admin"
        }
        
        success, response = self.make_request('POST', 'auth/register', admin_data, expected_status=200)
        
        if success:
            if (response.get('email') == admin_data['email'] and 
                response.get('role') == 'admin'):
                self.log_test("Admin Registration", True, "Admin registered successfully", response)
                return True
            else:
                self.log_test("Admin Registration", False, "Invalid response data", response)
                return False
        else:
            # Check if it's a duplicate email error (which is acceptable)
            if isinstance(response, dict) and "already registered" in str(response.get('detail', '')):
                self.log_test("Admin Registration", True, "Admin already exists (acceptable)", response)
                return True
            else:
                self.log_test("Admin Registration", False, f"Registration failed: {response}")
                return False

    def test_customer_login(self):
        """Test customer login"""
        login_data = {
            "email": "customer@demo.com",
            "password": "password123"
        }
        
        success, response = self.make_request('POST', 'auth/login', login_data)
        
        if success:
            if (response.get('access_token') and 
                response.get('token_type') == 'bearer' and
                response.get('role') == 'customer'):
                self.customer_token = response['access_token']
                self.log_test("Customer Login", True, "Customer login successful", 
                            {"token_received": True, "role": response.get('role')})
                return True
            else:
                self.log_test("Customer Login", False, "Invalid login response", response)
                return False
        else:
            self.log_test("Customer Login", False, f"Login failed: {response}")
            return False

    def test_admin_login(self):
        """Test admin login"""
        login_data = {
            "email": "admin@demo.com",
            "password": "password123"
        }
        
        success, response = self.make_request('POST', 'auth/login', login_data)
        
        if success:
            if (response.get('access_token') and 
                response.get('token_type') == 'bearer' and
                response.get('role') == 'admin'):
                self.admin_token = response['access_token']
                self.log_test("Admin Login", True, "Admin login successful", 
                            {"token_received": True, "role": response.get('role')})
                return True
            else:
                self.log_test("Admin Login", False, "Invalid login response", response)
                return False
        else:
            self.log_test("Admin Login", False, f"Login failed: {response}")
            return False

    def test_customer_profile(self):
        """Test getting customer profile"""
        if not self.customer_token:
            self.log_test("Customer Profile", False, "No customer token available")
            return False
            
        success, response = self.make_request('GET', 'auth/me', token=self.customer_token)
        
        if success:
            if (response.get('email') == 'customer@demo.com' and 
                response.get('role') == 'customer'):
                self.log_test("Customer Profile", True, "Profile retrieved successfully", response)
                return True
            else:
                self.log_test("Customer Profile", False, "Invalid profile data", response)
                return False
        else:
            self.log_test("Customer Profile", False, f"Profile request failed: {response}")
            return False

    def test_location_update(self):
        """Test customer location update"""
        if not self.customer_token:
            self.log_test("Location Update", False, "No customer token available")
            return False
            
        location_data = {
            "locality": "Koramangala",
            "area": "5th Block",
            "city": "Bangalore",
            "district": "Karnataka",
            "pincode": "560095"
        }
        
        success, response = self.make_request('POST', 'customers/update-location', 
                                            location_data, token=self.customer_token)
        
        if success:
            if response.get('message') == 'Location updated successfully':
                self.log_test("Location Update", True, "Location updated successfully", response)
                return True
            else:
                self.log_test("Location Update", False, "Unexpected response message", response)
                return False
        else:
            self.log_test("Location Update", False, f"Location update failed: {response}")
            return False

    def test_subscription(self):
        """Test customer subscription"""
        if not self.customer_token:
            self.log_test("Customer Subscription", False, "No customer token available")
            return False
            
        subscription_data = {
            "subscription_type": "baby_standard"
        }
        
        success, response = self.make_request('POST', 'customers/subscribe', 
                                            subscription_data, token=self.customer_token)
        
        if success:
            if response.get('message') == 'Subscription activated successfully':
                self.log_test("Customer Subscription", True, "Subscription activated successfully", response)
                return True
            else:
                self.log_test("Customer Subscription", False, "Unexpected response message", response)
                return False
        else:
            self.log_test("Customer Subscription", False, f"Subscription failed: {response}")
            return False

    def test_admin_dashboard(self):
        """Test admin dashboard"""
        if not self.admin_token:
            self.log_test("Admin Dashboard", False, "No admin token available")
            return False
            
        success, response = self.make_request('GET', 'admin/dashboard', token=self.admin_token)
        
        if success:
            required_fields = ['total_subscribers', 'monthly_subscribers', 'yearly_subscribers', 
                             'todays_appointments', 'pending_assignments']
            
            if all(field in response for field in required_fields):
                # Check if all values are integers
                if all(isinstance(response[field], int) for field in required_fields):
                    self.log_test("Admin Dashboard", True, "Dashboard data retrieved successfully", response)
                    return True
                else:
                    self.log_test("Admin Dashboard", False, "Dashboard fields are not integers", response)
                    return False
            else:
                missing_fields = [field for field in required_fields if field not in response]
                self.log_test("Admin Dashboard", False, f"Missing fields: {missing_fields}", response)
                return False
        else:
            self.log_test("Admin Dashboard", False, f"Dashboard request failed: {response}")
            return False

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        # Test admin dashboard without token
        success, response = self.make_request('GET', 'admin/dashboard', expected_status=401)
        
        if not success and response.get('detail') == 'Not authenticated':
            self.log_test("Unauthorized Access Protection", True, "Properly blocked unauthorized access")
            return True
        else:
            self.log_test("Unauthorized Access Protection", False, 
                         "Should have blocked unauthorized access", response)
            return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_login = {
            "email": "invalid@test.com",
            "password": "wrongpassword"
        }
        
        success, response = self.make_request('POST', 'auth/login', invalid_login, expected_status=401)
        
        if not success and 'Incorrect email or password' in str(response.get('detail', '')):
            self.log_test("Invalid Login Protection", True, "Properly rejected invalid credentials")
            return True
        else:
            self.log_test("Invalid Login Protection", False, 
                         "Should have rejected invalid credentials", response)
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Vihaan Care Nest API Testing...")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic endpoint tests
        self.test_root_endpoint()
        self.test_packages_endpoint()
        
        # Authentication tests
        self.test_customer_registration()
        self.test_admin_registration()
        self.test_customer_login()
        self.test_admin_login()
        
        # Protected endpoint tests
        self.test_customer_profile()
        self.test_location_update()
        self.test_subscription()
        self.test_admin_dashboard()
        
        # Security tests
        self.test_unauthorized_access()
        self.test_invalid_login()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Summary:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Return success if all critical tests pass
        critical_failures = self.tests_run - self.tests_passed
        return critical_failures == 0

def main():
    """Main test execution"""
    tester = VihaanCareNestAPITester()
    
    try:
        success = tester.run_all_tests()
        
        # Save detailed results
        results = {
            "timestamp": datetime.now().isoformat(),
            "base_url": tester.base_url,
            "summary": {
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "failed_tests": tester.tests_run - tester.tests_passed,
                "success_rate": (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0
            },
            "detailed_results": tester.test_results
        }
        
        with open('/app/backend_test_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
        
        return 0 if success else 1
        
    except Exception as e:
        print(f"❌ Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())