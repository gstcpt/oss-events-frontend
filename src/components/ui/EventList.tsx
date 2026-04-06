import React from 'react';

interface Event {
  name: string;
  date: string;
  client: string;
  type: string;
  status?: string;
}

interface EventListProps {
  title: string;
  events: Event[];
  showStatus?: boolean;
}

export const EventList: React.FC<EventListProps> = ({ title, events, showStatus = false }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 ${showStatus ? 'bg-blue-100' : 'bg-purple-100'} rounded-full flex items-center justify-center`}>
                    <span className={`${showStatus ? 'text-blue-600' : 'text-purple-600'} font-semibold text-sm`}>
                      {event.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{event.name}</p>
                  <p className="text-sm">{event.client} • {event.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm">{event.date}</div>
                {showStatus && event.status && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};