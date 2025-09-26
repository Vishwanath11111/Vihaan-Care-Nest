import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { 
  Heart, 
  LogOut, 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  UserCheck,
  DollarSign,
  Activity,
  BarChart3,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    total_subscribers: 0,
    monthly_subscribers: 0,
    yearly_subscribers: 0,
    todays_appointments: 0,
    pending_assignments: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error("Failed to load dashboard data");
    }
  };

  const StatCard = ({ title, value, icon, color, description }) => (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-3xl font-bold ${color}`} data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-full ${color.includes('emerald') ? 'bg-emerald-100' : color.includes('blue') ? 'bg-blue-100' : color.includes('orange') ? 'bg-orange-100' : 'bg-purple-100'}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      {/* Navigation Header */}
      <header className="navbar-glass border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Heart className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-xl font-bold gradient-text">Vihaan Care Nest</h1>
              <p className="text-sm text-gray-600">Admin Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700" data-testid="admin-role-badge">
              Administrator
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-gray-600 hover:text-red-600"
              data-testid="admin-logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name}
          </h2>
          <p className="text-gray-600">
            Here's an overview of your care service operations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4" data-testid="admin-dashboard-tabs">
            <TabsTrigger value="overview" data-testid="admin-overview-tab">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="subscribers" data-testid="admin-subscribers-tab">
              <Users className="w-4 h-4 mr-2" />
              Subscribers
            </TabsTrigger>
            <TabsTrigger value="appointments" data-testid="admin-appointments-tab">
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="team" data-testid="admin-team-tab">
              <UserCheck className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Subscribers"
                value={dashboardData.total_subscribers}
                icon={<Users className="w-6 h-6 text-emerald-600" />}
                color="text-emerald-600"
                description="Active subscriptions"
              />
              <StatCard
                title="This Month"
                value={dashboardData.monthly_subscribers}
                icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
                color="text-blue-600"
                description="New subscribers"
              />
              <StatCard
                title="Today's Schedule"
                value={dashboardData.todays_appointments}
                icon={<Calendar className="w-6 h-6 text-orange-600" />}
                color="text-orange-600"
                description="Appointments today"
              />
              <StatCard
                title="Pending Assignments"
                value={dashboardData.pending_assignments}
                icon={<Clock className="w-6 h-6 text-purple-600" />}
                color="text-purple-600"
                description="Need team assignment"
              />
            </div>

            {/* Monthly Overview */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                    Growth Overview
                  </CardTitle>
                </CardHeader>
                <CardContent data-testid="growth-overview">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">This Year</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {dashboardData.yearly_subscribers}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">This Month</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {dashboardData.monthly_subscribers}
                      </span>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500">
                        {dashboardData.monthly_subscribers > 0 
                          ? `${((dashboardData.monthly_subscribers / Math.max(dashboardData.total_subscribers, 1)) * 100).toFixed(1)}% growth this month`
                          : "No new subscribers this month"
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-emerald-600" />
                    Daily Operations
                  </CardTitle>
                </CardHeader>
                <CardContent data-testid="daily-operations">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Today's Visits</span>
                      <Badge 
                        className={dashboardData.todays_appointments > 0 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-700"
                        }
                      >
                        {dashboardData.todays_appointments}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Unassigned</span>
                      <Badge 
                        className={dashboardData.pending_assignments > 0 
                          ? "bg-orange-100 text-orange-700" 
                          : "bg-green-100 text-green-700"
                        }
                      >
                        {dashboardData.pending_assignments}
                      </Badge>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500">
                        {dashboardData.pending_assignments === 0 
                          ? "All appointments assigned ✅" 
                          : `${dashboardData.pending_assignments} appointments need team assignment`
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <p className="text-gray-600">Common administrative tasks</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    className="h-16 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setActiveTab('subscribers')}
                    data-testid="quick-view-subscribers"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    View All Subscribers
                  </Button>
                  <Button 
                    className="h-16 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setActiveTab('appointments')}
                    data-testid="quick-manage-schedule"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Manage Schedule
                  </Button>
                  <Button 
                    className="h-16 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => setActiveTab('team')}
                    data-testid="quick-assign-team"
                  >
                    <UserCheck className="w-5 h-5 mr-2" />
                    Assign Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-emerald-600" />
                  Subscriber Management
                </CardTitle>
                <p className="text-gray-600">View and manage all customer subscriptions</p>
              </CardHeader>
              <CardContent data-testid="subscribers-management">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Subscriber management system</p>
                  <p className="text-sm text-gray-400">
                    Feature coming soon - View all subscribers, their packages, and payment status
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
                  Appointment Scheduling
                </CardTitle>
                <p className="text-gray-600">Manage appointments and team assignments</p>
              </CardHeader>
              <CardContent data-testid="appointments-management">
                {dashboardData.todays_appointments > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <h3 className="font-semibold text-emerald-700 mb-2">Today's Schedule</h3>
                      <p className="text-emerald-600">
                        {dashboardData.todays_appointments} appointments scheduled for today
                      </p>
                    </div>
                    
                    {dashboardData.pending_assignments > 0 && (
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h3 className="font-semibold text-orange-700 mb-2">Action Required</h3>
                        <p className="text-orange-600">
                          {dashboardData.pending_assignments} appointments need team member assignment
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No appointments for today</p>
                    <p className="text-sm text-gray-400">
                      New appointments will appear here as customers subscribe
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-emerald-600" />
                  Team Management
                </CardTitle>
                <p className="text-gray-600">Manage team members and their assignments</p>
              </CardHeader>
              <CardContent data-testid="team-management">
                <div className="text-center py-12">
                  <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Team management system</p>
                  <p className="text-sm text-gray-400">
                    Feature coming soon - Add team members, manage schedules, and track performance
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Information */}
        <Card className="mt-8 glass">
          <CardHeader>
            <CardTitle>Business Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-emerald-600" />
                <div>
                  <Label className="text-sm font-medium text-gray-500">Customer Care</Label>
                  <p className="text-lg">+91 97405 17671</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-600" />
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">vishwanathmunjannavar1@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <div>
                  <Label className="text-sm font-medium text-gray-500">Service Areas</Label>
                  <p className="text-lg">Bangalore & Dharwad</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;