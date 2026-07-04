import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Library from './pages/Library'
import Player from './pages/Player'
import Sleep from './pages/Sleep'
import Onboarding from './pages/Onboarding'
import BottomNav from './components/BottomNav'

function RequireOnboarding({ children }) {
  const done = localStorage.getItem('aether_onboarded')
  return done ? children : <Navigate to="/onboarding" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-dvh max-w-lg mx-auto relative">
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<RequireOnboarding><Home /></RequireOnboarding>} />
          <Route path="/library" element={<RequireOnboarding><Library /></RequireOnboarding>} />
          <Route path="/play/:id" element={<RequireOnboarding><Player /></RequireOnboarding>} />
          <Route path="/sleep" element={<RequireOnboarding><Sleep /></RequireOnboarding>} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
