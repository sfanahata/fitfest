"use client";

export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-gray-50 rounded shadow p-6 ${className}`}>
      {children}
    </div>
  );
} 