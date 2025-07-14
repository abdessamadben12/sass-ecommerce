import { Bell, Clock } from "lucide-react";

export function NotificationCard({ notifications ,numberNot}) {
  return (
    <div className="w-64 bg-white rounded-lg shadow-lg p-3 border  border-gray-200">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3 flex-col ">
       <span className="text-sm font-semibold text-gray-600">
    Notification
 </span>
 <span className="text-sm font-sm text-gray-500 block">You have 46 unread notification</span>
      </div>
      {/* Liste scrollable */}
      <ul className="max-h-60 overflow-y-auto space-y-2">
        {notifications.map(({ id, title, time, unread }) => (
          <li
            key={id}
            className="flex flex-col items-start justify-between border-b w-full  border-b-gray-200 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
          >
            <div className="flex  items-center space-x-2">
              {unread && (
                <span className="w-2 h-2 bg-cyan-400 rounded-full mt-1" />
              )}
              <span className="text-sm text-gray-800 truncate">{title}</span>
            </div>
            <time className="text-xs text-blue-500 ml-2 flex-shrink-0 flex mt-2">
              <Clock className="mr-1"  size={15}/>
              {time}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
}
