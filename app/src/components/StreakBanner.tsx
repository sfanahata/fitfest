import React from 'react';
import { FireIcon, TrophyIcon, StarIcon } from '@heroicons/react/24/solid';

interface StreakBannerProps {
  daysWithActivity: number;
  streakMessage: string;
  hasStreak: boolean;
  totalActivities: number;
  totalDuration: number;
  totalCalories: number;
}

export default function StreakBanner({
  daysWithActivity,
  streakMessage,
  hasStreak,
  totalActivities,
  totalDuration,
  totalCalories,
}: StreakBannerProps) {
  // Don't show banner if no activities
  if (daysWithActivity === 0) {
    return null;
  }

  // Determine banner style based on streak level
  const getBannerStyle = () => {
    if (hasStreak) {
      return {
        container: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
        icon: 'text-yellow-300',
        glow: 'shadow-lg shadow-orange-500/25',
      };
    } else if (daysWithActivity >= 2) {
      return {
        container: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
        icon: 'text-blue-200',
        glow: 'shadow-lg shadow-blue-500/25',
      };
    } else {
      return {
        container: 'bg-gradient-to-r from-green-500 to-teal-500 text-white',
        icon: 'text-green-200',
        glow: 'shadow-lg shadow-green-500/25',
      };
    }
  };

  const getIcon = () => {
    if (hasStreak) {
      return <FireIcon className="w-8 h-8" />;
    } else if (daysWithActivity >= 2) {
      return <TrophyIcon className="w-8 h-8" />;
    } else {
      return <StarIcon className="w-8 h-8" />;
    }
  };

  const bannerStyle = getBannerStyle();

  return (
    <div className={`rounded-lg p-6 mb-6 ${bannerStyle.container} ${bannerStyle.glow} animate-pulse`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`${bannerStyle.icon} animate-bounce`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">
              {streakMessage}
            </h3>
            <div className="flex space-x-6 text-sm opacity-90">
              <span>{totalActivities} activities</span>
              <span>{totalDuration} minutes</span>
              <span>{totalCalories} calories burned</span>
            </div>
          </div>
        </div>
        
        {hasStreak && (
          <div className="text-right">
            <div className="text-3xl font-bold">
              {daysWithActivity}
            </div>
            <div className="text-sm opacity-90">
              days this week
            </div>
          </div>
        )}
      </div>
      
      {hasStreak && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-center space-x-2">
            <FireIcon className="w-5 h-5 text-yellow-300" />
            <span className="font-semibold">STREAK ACHIEVED!</span>
            <FireIcon className="w-5 h-5 text-yellow-300" />
          </div>
          <p className="text-center text-sm opacity-90 mt-1">
            You're on fire! Keep up the amazing work! 🔥
          </p>
        </div>
      )}
    </div>
  );
}
