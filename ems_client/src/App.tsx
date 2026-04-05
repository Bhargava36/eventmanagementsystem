import './App.css'
import { Navbar } from './components/Molecules/Navbar'
import EventCard from './components/Molecules/EventCard'
import { HeroSection } from './components/ui/HeroSection'

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative">
        <HeroSection />
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-24">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Upcoming Events
            </h1>
            <p className="mt-2 text-gray-400">
              Don't miss out on the best experiences around you.
            </p>
          </div>
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
      </main>
      
      <footer className="py-12 text-center border-t border-white/10 text-gray-500 text-sm">
        &copy; 2024 Event Management System. All rights reserved.
      </footer>
    </div>
  )
}

export default App
