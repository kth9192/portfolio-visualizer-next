import React from "react";

interface DataInfoCardProps {
  children: React.ReactNode;
}

function DataInfoCard({ children }: DataInfoCardProps) {
  return (
    <div className="flex flex-col gap-2 p-6 rounded-md shadow">{children}</div>
  );
}

export default DataInfoCard;
