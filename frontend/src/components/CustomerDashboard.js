import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { 
  Heart, 
  LogOut, 
  User, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Settings,
  CheckCircle,
  Clock,
  Phone,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [customerData, setCustomerData] = useState(null);

  // Location form state
  const [locationData, setLocationData] = useState({
    locality: "",
    area: "",
    city: "",
    district: "",
    pincode: ""
  });

  useEffect(() => {
    fetchPackages();
    fetchCustomerData();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API}/packages`);
      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchCustomerData = async () => {
    try {
      // This would typically fetch customer-specific data
      // For now, we'll simulate it
      setCustomerData({
        subscription: null,
        location: null,
        appointments: []
      });
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const handleLocationUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(`${API}/customers/update-location`, locationData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      toast.success("Location updated successfully!");
      
      // Update local state
      setCustomerData(prev => ({
        ...prev,
        location: locationData
      }));
      
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error(error.response?.data?.detail || "Failed to update location");
    }

    setIsLoading(false);
  };

  const handleSubscription = async (subscriptionType) => {
    setIsLoading(true);

    try {
      await axios.post(`${API}/customers/subscribe`, {
        subscription_type: subscriptionType
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      toast.success("Subscription activated! You will be contacted shortly.");
      
      // Update local state
      setCustomerData(prev => ({
        ...prev,
        subscription: { type: subscriptionType, active: true }
      }));
      
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error(error.response?.data?.detail || "Failed to subscribe");
    }

    setIsLoading(false);
  };

  const updateLocationData = (field, value) => {
    setLocationData(prev => ({ ...prev, [field]: value }));
  };

  const getPackageDetails = (packageId) => {
    return packages.find(pkg => pkg.type === packageId);
  };

  const babyPackages = packages.filter(pkg => pkg.target === 'baby');
  const motherPackages = packages.filter(pkg => pkg.target === 'mother');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      {/* Navigation Header */}
      <header className="navbar-glass border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Heart className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-xl font-bold gradient-text">Vihaan Care Nest</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.full_name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700" data-testid="user-role-badge">
              Customer
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-gray-600 hover:text-red-600"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4" data-testid="dashboard-tabs">
            <TabsTrigger value="overview" data-testid="overview-tab">
              <User className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="location" data-testid="location-tab">
              <MapPin className="w-4 h-4 mr-2" />
              Location
            </TabsTrigger>
            <TabsTrigger value="packages" data-testid="packages-tab">
              <CreditCard className="w-4 h-4 mr-2" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="appointments" data-testid="appointments-tab">
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Profile Card */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-emerald-600" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="profile-info">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                    <p className="text-lg font-semibold">{user?.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-lg">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p className="text-lg">{user?.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Account Type</Label>
                    <Badge className="bg-emerald-100 text-emerald-700">Customer</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Status */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-emerald-600" />
                    Subscription Status
                  </CardTitle>
                </CardHeader>
                <CardContent data-testid="subscription-status">
                  {customerData?.subscription?.active ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span className="font-medium text-green-700">Active Subscription</span>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Package</Label>
                        <p className="text-lg font-semibold">
                          {getPackageDetails(customerData.subscription.type)?.name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Monthly Cost</Label>
                        <p className="text-lg font-semibold text-emerald-600">
                          ₹{getPackageDetails(customerData.subscription.type)?.price_per_month.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No active subscription</p>
                      <Button
                        onClick={() => setActiveTab('packages')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        data-testid="view-packages-btn"
                      >
                        View Packages
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Location Status */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                  Service Location
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="location-status">
                {customerData?.location ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Locality</Label>
                      <p className="text-lg">{customerData.location.locality}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Area</Label>
                      <p className="text-lg">{customerData.location.area}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">City</Label>
                      <p className="text-lg">{customerData.location.city}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Pincode</Label>
                      <p className="text-lg">{customerData.location.pincode}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Location not set</p>
                    <Button
                      onClick={() => setActiveTab('location')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      data-testid="set-location-btn"
                    >
                      Set Location
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-emerald-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone</Label>
                      <p className="text-lg">+91 97405 17671</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-emerald-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-lg text-xs">vishwanathmunjannavar1@gmail.com</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location">
            <Card className="card-hover max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                  Update Service Location
                </CardTitle>
                <p className="text-gray-600">Please provide your location for our care services</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLocationUpdate} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="locality">Locality *</Label>
                      <Input
                        id="locality"
                        type="text"
                        placeholder="e.g., Koramangala"
                        value={locationData.locality}
                        onChange={(e) => updateLocationData('locality', e.target.value)}
                        className="form-input"
                        required
                        data-testid="locality-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="area">Area *</Label>
                      <Input
                        id="area"
                        type="text"
                        placeholder="e.g., 5th Block"
                        value={locationData.area}
                        onChange={(e) => updateLocationData('area', e.target.value)}
                        className="form-input"
                        required
                        data-testid="area-input"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Select 
                        value={locationData.city} 
                        onValueChange={(value) => updateLocationData('city', value)}
                        required
                      >
                        <SelectTrigger className="form-input" data-testid="city-select">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bangalore" data-testid="city-bangalore">Bangalore</SelectItem>
                          <SelectItem value="Dharwad" data-testid="city-dharwad">Dharwad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="district">District *</Label>
                      <Input
                        id="district"
                        type="text"
                        value="Karnataka"
                        readOnly
                        className="form-input bg-gray-50"
                        data-testid="district-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      type="text"
                      placeholder="e.g., 560095"
                      value={locationData.pincode}
                      onChange={(e) => updateLocationData('pincode', e.target.value)}
                      className="form-input"
                      required
                      data-testid="pincode-input"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white btn-hover-lift"
                    disabled={isLoading}
                    data-testid="update-location-btn"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="spinner mr-2"></div>
                        Updating Location...
                      </div>
                    ) : (
                      'Update Location'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-8">
            {/* Baby Packages */}
            <div>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Newborn Baby Care</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {babyPackages.map((pkg, index) => (
                  <Card key={pkg.id} className={`package-card card-hover ${index === 1 ? 'ring-2 ring-emerald-300 shadow-xl' : ''}`} data-testid={`baby-package-${pkg.id}`}>
                    {index === 1 && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white">
                        Most Popular
                      </Badge>
                    )}
                    <CardContent className="p-6">
                      <div className="text-center mb-6">
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                        <div className="text-3xl font-bold text-emerald-600 mb-1">
                          ₹{pkg.price_per_month.toLocaleString()}
                        </div>
                        <p className="text-gray-600">per month</p>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                          <span className="text-sm">{pkg.visits_per_week} visits per week</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                          <span className="text-sm">2 hours per visit</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                          <span className="text-sm">Baby bath & oil massage</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                          <span className="text-sm">Trained care professionals</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white btn-hover-lift"
                        onClick={() => handleSubscription(pkg.type)}
                        disabled={isLoading}
                        data-testid={`subscribe-baby-${pkg.id}-btn`}
                      >
                        {isLoading ? 'Processing...' : 'Subscribe Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Mother Packages */}
            <div>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Postpartum Mother Care</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {motherPackages.map((pkg, index) => (
                  <Card key={pkg.id} className={`package-card card-hover ${index === 1 ? 'ring-2 ring-rose-300 shadow-xl' : ''}`} data-testid={`mother-package-${pkg.id}`}>
                    {index === 1 && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-rose-600 text-white">
                        Most Popular
                      </Badge>
                    )}
                    <CardContent className="p-6">
                      <div className="text-center mb-6">
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                        <div className="text-3xl font-bold text-rose-600 mb-1">
                          ₹{pkg.price_per_month.toLocaleString()}
                        </div>
                        <p className="text-gray-600">per month</p>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-rose-600 mr-2" />
                          <span className="text-sm">{pkg.visits_per_week} visits per week</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-rose-600 mr-2" />
                          <span className="text-sm">2 hours per visit</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-rose-600 mr-2" />
                          <span className="text-sm">Postpartum body massage</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-rose-600 mr-2" />
                          <span className="text-sm">Recovery care support</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white btn-hover-lift"
                        onClick={() => handleSubscription(pkg.type)}
                        disabled={isLoading}
                        data-testid={`subscribe-mother-${pkg.id}-btn`}
                      >
                        {isLoading ? 'Processing...' : 'Subscribe Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            <Card className="max-w-2xl mx-auto glass">
              <CardHeader>
                <CardTitle className="text-center">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  After subscribing, you will be contacted by our team for payment setup and scheduling.
                </p>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-emerald-700 font-medium">
                    📱 UPI Payment & Bank Transfer options available
                  </p>
                  <p className="text-sm text-emerald-600 mt-1">
                    Our team will provide payment details upon subscription
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
                  Your Appointments
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="appointments-list">
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No appointments scheduled yet</p>
                  <p className="text-sm text-gray-400">
                    Once you subscribe, our team will contact you to schedule your first appointment
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;