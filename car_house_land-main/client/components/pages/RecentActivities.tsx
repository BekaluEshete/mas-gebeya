// components/RecentActivities.tsx
import React from 'react';
import { useApp } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, User, Package, DollarSign, Headphones, Car, Home, MapPin, Wrench, RefreshCw } from 'lucide-react';

const RecentActivities = () => {
  const { activities, activitiesLoading, fetchRecentActivities } = useApp();

  const getActivityIcon = (entityType: string, action: string) => {
    const entityIcons = {
      user: <User className="w-4 h-4" />,
      car: <Car className="w-4 h-4" />,
      property: <Home className="w-4 h-4" />,
      land: <MapPin className="w-4 h-4" />,
      machine: <Wrench className="w-4 h-4" />,
      deal: <DollarSign className="w-4 h-4" />,
      consultation: <Headphones className="w-4 h-4" />,
      default: <Package className="w-4 h-4" />
    };

    return entityIcons[entityType as keyof typeof entityIcons] || entityIcons.default;
  };

  const getActivityColor = (action: string) => {
    const colors = {
      created: 'bg-green-500',
      updated: 'bg-blue-500',
      deleted: 'bg-red-500',
      logged_in: 'bg-purple-500',
      signed_up: 'bg-indigo-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      completed: 'bg-emerald-500',
      pending: 'bg-yellow-500',
      cancelled: 'bg-red-500',
      default: 'bg-gray-500'
    };
    return colors[action as keyof typeof colors] || colors.default;
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return activityTime.toLocaleDateString();
  };

  if (activitiesLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-sm sm:text-base">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-brand-orange" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Latest platform updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-sm sm:text-base">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-brand-orange" />
            Recent Activity
          </CardTitle>
          <RefreshCw 
            className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors" 
            onClick={() => fetchRecentActivities()}
          />
        </div>
        <CardDescription className="text-xs sm:text-sm">Latest platform updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No recent activities</p>
            </div>
          ) : (
            activities.slice(0, 6).map((activity) => (
              <div
                key={activity._id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${getActivityColor(activity.action)}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getActivityIcon(activity.entityType, activity.action)}
                    <p className="text-xs sm:text-sm font-medium">
                      <span className="text-blue-600">{activity.user?.fullName}</span> {activity.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs capitalize">
                      {activity.entityType}
                    </Badge>
                    <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;