import React, { useState } from 'react'
import Upload from './pages/Upload'
import Calls from './pages/Calls'

function App() {
  const [page, setPage] = useState<'upload' | 'calls'>('upload')

  return (
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
        <button onClick={() => setPage('upload')} style={{ marginRight: '1rem' }}>Upload Call</button>
        <button onClick={() => setPage('calls')}>Calls List</button>
      </nav>

      <div style={{ padding: '0 1rem' }}>
        {page === 'upload' ? <Upload /> : <Calls />}
      </div>
    </div>
  )
}

export default App

