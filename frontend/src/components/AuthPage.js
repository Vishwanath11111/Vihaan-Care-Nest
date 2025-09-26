import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Heart, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, login, register } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    role: "customer"
  });

  useEffect(() => {
    // Redirect if already authenticated
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'customer') {
        navigate('/customer');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(loginData.email, loginData.password);
    
    if (success) {
      // Navigation will be handled by the useEffect above
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (!registerData.full_name.trim()) {
      toast.error("Full name is required");
      setIsLoading(false);
      return;
    }

    if (!registerData.phone.trim()) {
      toast.error("Phone number is required");
      setIsLoading(false);
      return;
    }

    const success = await register({
      email: registerData.email,
      password: registerData.password,
      full_name: registerData.full_name,
      phone: registerData.phone,
      role: registerData.role
    });

    if (success) {
      setActiveTab("login");
      setRegisterData({
        email: "",
        password: "",
        confirmPassword: "",
        full_name: "",
        phone: "",
        role: "customer"
      });
    }

    setIsLoading(false);
  };

  const updateLoginData = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const updateRegisterData = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-gray-600 hover:text-emerald-600"
          data-testid="auth-back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="glass shadow-2xl border-0">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Heart className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl font-bold gradient-text">Vihaan Care Nest</span>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {activeTab === 'login' ? 'Welcome Back' : 'Join Our Family'}
            </CardTitle>
            <p className="text-gray-600">
              {activeTab === 'login' 
                ? 'Sign in to access your dashboard' 
                : 'Create your account to get started'
              }
            </p>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6" data-testid="auth-tabs">
                <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
                <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => updateLoginData('email', e.target.value)}
                      className="form-input"
                      required
                      data-testid="login-email-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => updateLoginData('password', e.target.value)}
                        className="form-input pr-10"
                        required
                        data-testid="login-password-input"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        data-testid="login-toggle-password"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white btn-hover-lift"
                    disabled={isLoading}
                    data-testid="login-submit-btn"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="spinner mr-2"></div>
                        Signing In...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerData.full_name}
                      onChange={(e) => updateRegisterData('full_name', e.target.value)}
                      className="form-input"
                      required
                      data-testid="register-fullname-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="register_email">Email Address</Label>
                    <Input
                      id="register_email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) => updateRegisterData('email', e.target.value)}
                      className="form-input"
                      required
                      data-testid="register-email-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={registerData.phone}
                      onChange={(e) => updateRegisterData('phone', e.target.value)}
                      className="form-input"
                      required
                      data-testid="register-phone-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Account Type</Label>
                    <Select 
                      value={registerData.role} 
                      onValueChange={(value) => updateRegisterData('role', value)}
                    >
                      <SelectTrigger className="form-input" data-testid="register-role-select">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer" data-testid="role-customer">Customer</SelectItem>
                        <SelectItem value="admin" data-testid="role-admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="register_password">Password</Label>
                    <div className="relative">
                      <Input
                        id="register_password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => updateRegisterData('password', e.target.value)}
                        className="form-input pr-10"
                        required
                        data-testid="register-password-input"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        data-testid="register-toggle-password"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <Input
                      id="confirm_password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={(e) => updateRegisterData('confirmPassword', e.target.value)}
                      className="form-input"
                      required
                      data-testid="register-confirm-password-input"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white btn-hover-lift"
                    disabled={isLoading}
                    data-testid="register-submit-btn"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="spinner mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Demo Accounts Info */}
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm font-medium text-emerald-700 mb-2">Demo Accounts:</p>
              <div className="text-xs text-emerald-600 space-y-1">
                <p><strong>Customer:</strong> customer@demo.com / password123</p>
                <p><strong>Admin:</strong> admin@demo.com / password123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;