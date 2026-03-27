import { Navigate, Route, Routes } from 'react-router-dom'

import { MobileTabNav } from './components/layout/MobileTabNav'
import { PageHeader } from './components/layout/PageHeader'
import { BadgesPage } from './pages/BadgesPage'
import { PokemonPage } from './pages/PokemonPage'
import { RoadmapPage } from './pages/RoadmapPage'

function App() {
  return (
    <div className="app-layout">
      <div className="page-shell page-shell--header">
        <PageHeader />
      </div>

      <main className="page-shell page-shell--content">
        <Routes>
          <Route element={<Navigate replace to="/pokemons" />} path="/" />
          <Route element={<PokemonPage />} path="/pokemons" />
          <Route element={<RoadmapPage />} path="/roadmap" />
          <Route element={<BadgesPage />} path="/medallas" />
        </Routes>
      </main>

      <MobileTabNav />
    </div>
  )
}

export default App
