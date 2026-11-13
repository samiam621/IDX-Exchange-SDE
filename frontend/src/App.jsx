import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ListingsPage from './pages/ListingsPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import './App.css'

// App root: / is the listings page, /property/:id is one property
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListingsPage />} />
        <Route path="/property/:id" element={<PropertyDetailPage />} />
        <Route path="*" element={<p className="status">Page not found</p>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
