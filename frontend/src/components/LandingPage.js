import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Heart, Phone, Mail, MapPin, Clock, Shield, Users, Star, CheckCircle } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'customer') {
        navigate('/customer');
      }
    }

    // Fetch packages
    fetchPackages();
  }, [user, navigate]);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API}/packages`);
      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const benefits = [
    {
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      title: "Promotes Healthy Skin",
      description: "Oil massage keeps baby's skin soft, hydrated, and protected from rashes."
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      title: "Strengthens Muscles & Bones",
      description: "Improves blood circulation and supports healthy growth and development."
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      title: "Better Sleep for Baby & Parents",
      description: "Babies who get gentle massage and bath sleep more peacefully at night."
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: "Enhances Bonding",
      description: "Skin-to-skin contact creates emotional connection between parent and child."
    },
    {
      icon: <Star className="w-6 h-6 text-amber-500" />,
      title: "Boosts Immunity & Digestion",
      description: "Massage stimulates nerve endings and metabolism, aiding overall health."
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Bangalore",
      text: "The care team at Vihaan Care Nest has been incredible. My baby sleeps so much better after their gentle massages!",
      rating: 5
    },
    {
      name: "Rajesh Kumar",
      location: "Dharwad",
      text: "Professional, caring, and reliable. They've made our postpartum journey so much easier.",
      rating: 5
    },
    {
      name: "Ananya Reddy",
      location: "Bangalore",
      text: "I was nervous about letting someone else care for my newborn, but their expertise gave me confidence.",
      rating: 5
    }
  ];

  const babyPackages = packages.filter(pkg => pkg.target === 'baby');
  const motherPackages = packages.filter(pkg => pkg.target === 'mother');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="navbar-glass fixed w-full top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold gradient-text">Vihaan Care Nest</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#services" className="text-gray-700 hover:text-emerald-600 transition-colors">Services</a>
            <a href="#packages" className="text-gray-700 hover:text-emerald-600 transition-colors">Packages</a>
            <a href="#about" className="text-gray-700 hover:text-emerald-600 transition-colors">About</a>
            <a href="#contact" className="text-gray-700 hover:text-emerald-600 transition-colors">Contact</a>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white btn-hover-lift"
              data-testid="nav-login-btn"
            >
              Login / Register
            </Button>
          </div>
          <Button 
            onClick={() => navigate('/auth')} 
            className="md:hidden bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="mobile-login-btn"
          >
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-200" data-testid="hero-badge">
              ✨ Trusted by 500+ Families in Bangalore & Dharwad
            </Badge>
            <h1 className="responsive-text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Give your newborn the gift of
              <span className="gradient-text block mt-2">gentle care!</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-4xl mx-auto leading-relaxed">
              A warm bath and soothing oil massage not only keeps their skin soft and muscles strong but also helps them sleep peacefully at night—so parents can enjoy a restful, uninterrupted night too.
            </p>
            <p className="text-2xl font-semibold text-emerald-700 mb-8">
              "Happy Baby, Happy Parents!"
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 text-lg btn-hover-lift animate-pulse-slow"
                data-testid="hero-get-started-btn"
              >
                Start Your Care Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => document.getElementById('packages').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 text-lg border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
                data-testid="hero-view-packages-btn"
              >
                View Packages
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white" id="services">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Professional Baby Care?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our specialized care services provide essential benefits for your newborn's health and development
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="card-hover glass border-0 shadow-lg" data-testid={`benefit-card-${index}`}>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 bg-gradient-to-br from-white to-gray-50 rounded-full shadow-md">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-emerald-50 to-orange-50" id="packages">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Care Package</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Flexible subscription plans designed for newborn and mother care needs
            </p>
          </div>

          {/* Baby Packages */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Newborn Baby Care</h3>
            <div className="grid md:grid-cols-3 gap-8">
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
                      onClick={() => navigate('/auth')}
                      data-testid={`select-baby-${pkg.id}-btn`}
                    >
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mother Packages */}
          <div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Postpartum Mother Care</h3>
            <div className="grid md:grid-cols-3 gap-8">
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
                      onClick={() => navigate('/auth')}
                      data-testid={`select-mother-${pkg.id}-btn`}
                    >
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Parents Say</h2>
            <p className="text-lg text-gray-600">Real experiences from our happy families</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-hover" data-testid={`testimonial-${index}`}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-emerald-50 to-orange-50" id="about">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">About Vihaan Care Nest</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Founded by <span className="font-semibold text-emerald-700">Vishwanath V M & Megha V M</span>, 
              Vihaan Care Nest is dedicated to providing professional, compassionate care for newborns and new mothers. 
              We understand the precious nature of these early moments and are committed to supporting families 
              with expert care services.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <Card className="glass">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Areas</h3>
                  <p className="text-gray-600">Currently serving Bangalore & Dharwad, Karnataka</p>
                </CardContent>
              </Card>
              
              <Card className="glass">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Visit Duration</h3>
                  <p className="text-gray-600">Each care session lasts 1-2 hours for comprehensive care</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-white" id="contact">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600">Have questions? We're here to help!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <Phone className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600 mb-4">For immediate assistance and queries</p>
                <a 
                  href="tel:9740517671" 
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                  data-testid="contact-phone"
                >
                  +91 97405 17671
                </a>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 mb-4">Send us your questions anytime</p>
                <a 
                  href="mailto:vishwanathmunjannavar1@gmail.com" 
                  className="text-emerald-600 hover:text-emerald-700 font-semibold break-all"
                  data-testid="contact-email"
                >
                  vishwanathmunjannavar1@gmail.com
                </a>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 text-lg btn-hover-lift"
              data-testid="contact-get-started-btn"
            >
              Start Your Care Journey Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Heart className="w-8 h-8 text-emerald-400" />
            <span className="text-2xl font-bold">Vihaan Care Nest</span>
          </div>
          
          <p className="text-gray-400 mb-4">
            Professional newborn and postpartum care services in Karnataka
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
            <span>Founded by Vishwanath V M & Megha V M</span>
            <span>•</span>
            <span>Serving Bangalore & Dharwad</span>
            <span>•</span>
            <span>© 2024 Vihaan Care Nest</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;