import React, { useState } from 'react'
import Upload from './pages/Upload'
import Calls from './pages/Calls'

function App() {
  const [page, setPage] = useState<'upload' | 'calls'>('upload')

  return (
    <div>
      <nav className="nav-container">
        <div className="nav-content">
          <div className="nav-brand">Support Auditor</div>
          <div className="nav-links">
            <button
              className={`nav-button ${page === 'upload' ? 'active' : ''}`}
              onClick={() => setPage('upload')}
            >
              📤 Upload
            </button>
            <button
              className={`nav-button ${page === 'calls' ? 'active' : ''}`}
              onClick={() => setPage('calls')}
            >
              📋 Calls
            </button>
          </div>
        </div>
      </nav>

      {page === 'upload' ? <Upload /> : <Calls />}
    </div>
  )
}

export default App

