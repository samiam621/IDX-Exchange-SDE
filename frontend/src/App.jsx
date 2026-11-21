import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import ListingsPage from './pages/ListingsPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import FavoritesPage from './pages/FavoritesPage'
import ErrorBoundary from './components/ErrorBoundary'
import useFavorites from './hooks/useFavorites'
import './App.css'

// App root: / is the listings page, /property/:id is one property, /favorites is saved ones
function App() {
  // number of saved favorites, shown in the nav bar
  const { count } = useFavorites();

  return (
    <BrowserRouter>
      {/* top nav: links to listings and favorites (with count) */}
      <nav className="topnav">
        <NavLink to="/" end>Listings</NavLink>
        <NavLink to="/favorites">♥ Favorites ({count})</NavLink>
      </nav>
      {/* if any page crashes while rendering, show a recovery screen instead of a blank page */}
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<ListingsPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="*" element={<p className="status">Page not found</p>} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
