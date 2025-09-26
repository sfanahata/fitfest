import React from 'react';

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  count: number;
  color: string;
  gradient?: string;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  name,
  description,
  icon,
  count,
  color,
  gradient
}) => {
  const badgeStyle = gradient 
    ? { background: gradient }
    : { backgroundColor: color };

  return (
    <div className="relative group">
      {/* Badge */}
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
        style={badgeStyle}
        title={`${name}: ${description}`}
      >
        {icon}
      </div>
      
      {/* Count Badge */}
      {count > 1 && (
        <div className="absolute -bottom-1 -right-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-2 py-1 rounded-full min-w-[20px] text-center shadow-sm">
          x{count}
        </div>
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        <div className="font-semibold">{name}</div>
        <div className="text-xs opacity-90">{description}</div>
        {count > 1 && (
          <div className="text-xs opacity-75 mt-1">Earned {count} times</div>
        )}
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
      </div>
    </div>
  );
};

export default AchievementBadge;
