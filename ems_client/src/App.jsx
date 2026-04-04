import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import ThemeToggle from './Components/Organisms/ThemeToggler'
import EventCard from './Components/Molecules/EventCard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen p-8 transition-colors duration-300">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Upcoming Events
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Don't miss out on the best experiences around you.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <EventCard 
          title="Neon Echo Music Festival"
          date="Aug 16 - 18, 2024"
          location="City Park, Los Angeles"
          price="$49.00"
        />
        <EventCard 
          title="Cyberpunk Rave 2024"
          date="Sept 12, 2024"
          location="Abandoned Warehouse, NY"
          price="$35.00"
        />
        <EventCard 
          title="Summer Solstice Gala"
          date="June 21, 2024"
          location="The Grand Ballroom, Chicago"
          price="$120.00"
        />
      </div>
    </div>
  )
}

export default App
