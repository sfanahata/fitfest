import React from 'react';
import AchievementBadge from './AchievementBadge';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
  color: string;
  gradient?: string;
  earnedAt?: Date;
}

interface AchievementsSectionProps {
  achievements: Achievement[];
}

const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements }) => {
  if (achievements.length === 0) {
    return (
      <div className="bg-white dark:bg-fitfest-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Achievements</h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-gray-500 dark:text-gray-400">
            Complete workouts to earn your first achievement!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-fitfest-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Achievements</h2>
      <div className="flex flex-wrap gap-4">
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            name={achievement.name}
            description={achievement.description}
            icon={achievement.icon}
            count={achievement.count}
            color={achievement.color}
            gradient={achievement.gradient}
          />
        ))}
      </div>
      
      {/* Achievement Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Total Achievements: {achievements.length}</span>
          <span>Total Earned: {achievements.reduce((sum, achievement) => sum + achievement.count, 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default AchievementsSection;
