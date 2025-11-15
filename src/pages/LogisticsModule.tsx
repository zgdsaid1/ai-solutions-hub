import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import type { Libraries } from '@react-google-maps/api';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Plus, 
  Trash2, 
  Save, 
  BarChart3, 
  Clock, 
  TrendingUp,
  Route as RouteIcon,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk';
const libraries: Libraries = ['places'];

interface Route {
  id: string;
  route_name: string;
  origin_address: string;
  destination_address: string;
  total_distance: string;
  total_duration: number;
  status: string;
  created_at: string;
  waypoints: string[];
  route_data: any;
}

interface Analytics {
  total_routes: number;
  active_routes: number;
  completed_routes: number;
  total_distance_km: string;
  total_duration_hours: string;
  average_distance_km: string;
  average_duration_minutes: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

export default function LogisticsModule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });
  const [activeTab, setActiveTab] = useState<'planner' | 'routes' | 'analytics'>('planner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Route planning state
  const [routeName, setRouteName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [optimizationType, setOptimizationType] = useState('shortest');
  const [directions, setDirections] = useState<any>(null);
  const [routeSummary, setRouteSummary] = useState<any>(null);

  // Routes list state
  const [routes, setRoutes] = useState<Route[]>([]);

  // Analytics state
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (user && activeTab === 'routes') {
      fetchRoutes();
    }
    if (user && activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [user, activeTab]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('logistics-tracker', {
        body: {
          operation: 'get_routes',
          limit: 20
        }
      });

      if (error) throw error;

      setRoutes(data.data?.routes || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('logistics-tracker', {
        body: {
          operation: 'get_analytics'
        }
      });

      if (error) throw error;

      setAnalytics(data.data?.analytics || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeRoute = async () => {
    if (!origin || !destination) {
      setError('Please enter both origin and destination');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('logistics-tracker', {
        body: {
          operation: 'optimize_route',
          origin,
          destination,
          waypoints,
          optimizationType,
          route_name: routeName || `Route ${new Date().toLocaleDateString()}`
        }
      });

      if (error) throw error;

      setDirections(data.data?.directions);
      setRouteSummary(data.data?.summary);
      setSuccess('Route optimized successfully!');
      
      // Reset form
      setRouteName('');
      setOrigin('');
      setDestination('');
      setWaypoints([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWaypoint = () => {
    setWaypoints([...waypoints, '']);
  };

  const handleRemoveWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const handleUpdateWaypoint = (index: number, value: string) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = value;
    setWaypoints(newWaypoints);
  };

  const handleUpdateStatus = async (routeId: string, status: string) => {
    try {
      const { error } = await supabase.functions.invoke('logistics-tracker', {
        body: {
          operation: 'update_route_status',
          route_id: routeId,
          status
        }
      });

      if (error) throw error;

      setSuccess('Route status updated');
      fetchRoutes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;

    try {
      const { error } = await supabase.functions.invoke('logistics-tracker', {
        body: {
          operation: 'delete_route',
          route_id: routeId
        }
      });

      if (error) throw error;

      setSuccess('Route deleted successfully');
      fetchRoutes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500 p-3 rounded-xl">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Logistics & Route Optimizer</h1>
              <p className="text-gray-600">Plan and optimize delivery routes with AI</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'planner'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Navigation className="w-5 h-5" />
              Route Planner
            </div>
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'routes'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <RouteIcon className="w-5 h-5" />
              My Routes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics
            </div>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            {success}
          </div>
        )}

        {/* Route Planner Tab */}
        {activeTab === 'planner' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Route Planning Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-500" />
                Plan New Route
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Route Name
                  </label>
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="e.g., Morning Delivery Route"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin Address
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g., 123 Main St, New York, NY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination Address
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., 456 Oak Ave, Brooklyn, NY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waypoints (Optional)
                  </label>
                  {waypoints.map((waypoint, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={waypoint}
                        onChange={(e) => handleUpdateWaypoint(index, e.target.value)}
                        placeholder={`Stop ${index + 1} address`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleRemoveWaypoint(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddWaypoint}
                    className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Waypoint
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Optimization Type
                  </label>
                  <select
                    value={optimizationType}
                    onChange={(e) => setOptimizationType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="shortest">Shortest Distance</option>
                    <option value="fastest">Fastest Time</option>
                    <option value="cost">Cost Efficient</option>
                  </select>
                </div>

                <button
                  onClick={handleOptimizeRoute}
                  disabled={loading}
                  className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" />
                      Optimize Route
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Map Display */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Route Map</h2>
              {!isLoaded ? (
                <div className="flex items-center justify-center" style={{ height: '500px' }}>
                  <p className="text-gray-500">Loading map...</p>
                </div>
              ) : (
                // @ts-ignore - Google Maps types issue
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={defaultCenter}
                  zoom={10}
                >
                  {directions && (
                    // @ts-ignore - Google Maps types issue
                    <DirectionsRenderer
                      directions={directions}
                      options={{
                        polylineOptions: {
                          strokeColor: '#22c55e',
                          strokeWeight: 5
                        }
                      }}
                    />
                  )}
                </GoogleMap>
              )}

              {routeSummary && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Route Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Distance:</strong> {routeSummary.distance}</p>
                    <p><strong>Duration:</strong> {routeSummary.duration}</p>
                    <p><strong>Start:</strong> {routeSummary.start_address}</p>
                    <p><strong>End:</strong> {routeSummary.end_address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Routes Tab */}
        {activeTab === 'routes' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <RouteIcon className="w-5 h-5 text-green-500" />
              My Routes
            </h2>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading routes...</div>
            ) : routes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No routes found. Create your first route!
              </div>
            ) : (
              <div className="space-y-4">
                {routes.map((route) => (
                  <div key={route.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{route.route_name}</h3>
                        <p className="text-sm text-gray-600">
                          {route.origin_address} → {route.destination_address}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={route.status}
                          onChange={(e) => handleUpdateStatus(route.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteRoute(route.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{route.total_distance} km</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{Math.round(route.total_duration / 60)} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${
                          route.status === 'completed' ? 'text-green-500' : 'text-gray-400'
                        }`} />
                        <span className="capitalize">{route.status}</span>
                      </div>
                      <div className="text-gray-500">
                        {new Date(route.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-4 text-center py-8 text-gray-500">Loading analytics...</div>
            ) : analytics ? (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <RouteIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Routes</p>
                      <p className="text-2xl font-bold">{analytics.total_routes}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Routes</p>
                      <p className="text-2xl font-bold">{analytics.active_routes}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Distance</p>
                      <p className="text-2xl font-bold">{analytics.total_distance_km} km</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Time</p>
                      <p className="text-2xl font-bold">{analytics.total_duration_hours} hrs</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Distance</p>
                      <p className="text-2xl font-bold">{analytics.average_distance_km} km</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Clock className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Duration</p>
                      <p className="text-2xl font-bold">{analytics.average_duration_minutes} min</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-teal-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold">{analytics.completed_routes}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Efficiency</p>
                      <p className="text-2xl font-bold">
                        {analytics.total_routes > 0
                          ? Math.round((analytics.completed_routes / analytics.total_routes) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-4 text-center py-8 text-gray-500">
                No analytics data available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
