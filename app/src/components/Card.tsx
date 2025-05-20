"use client";

export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded shadow p-6 ${className}`}>
      {children}
    </div>
  );
} 