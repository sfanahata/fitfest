"use client";

export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-fitfest-dark-secondary rounded shadow dark:shadow-lg p-6 border border-gray-200 dark:border-fitfest-subtle/20 transition-colors duration-200 ${className}`}>
      {children}
    </div>
  );
} 