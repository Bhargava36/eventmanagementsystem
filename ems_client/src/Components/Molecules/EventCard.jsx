import React from 'react';
import eventImg from '../../assets/event_placeholder.png';

const EventCard = ({ title, date, location, price }) => {
  return (
    <div className="max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:scale-[1.02] dark:bg-gray-800 dark:shadow-blue-900/20 border border-gray-100 dark:border-gray-700">
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={eventImg} 
          alt={title} 
          className="h-full w-full object-cover"
        />
        <div className="absolute top-4 right-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
          {price}
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Music Festival
          </span>
          <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {date}
          </span>
        </div>
        
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        
        <div className="mb-4 flex items-center text-sm text-gray-600 dark:text-gray-300">
          <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </div>
        
        <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 active:transform active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-200 dark:shadow-none">
          Get Tickets
        </button>
      </div>
    </div>
  );
};

export default EventCard;
