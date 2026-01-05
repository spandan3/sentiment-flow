import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Upload from './pages/Upload'
import Calls from './pages/Calls'

function App() {
  const [page, setPage] = useState<'upload' | 'calls'>('upload')
  const shouldReduceMotion = useReducedMotion()

  const pageTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.22, ease: 'easeOut' }

  const buttonHover = shouldReduceMotion ? {} : { y: -1 }
  const buttonTap = shouldReduceMotion ? {} : { y: 0 }

  return (
    <div>
      <nav className="nav-container">
        <div className="nav-content">
          <div className="nav-brand">Support Auditor</div>
          <div className="nav-links">
            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              className={`nav-button ${page === 'upload' ? 'active' : ''}`}
              onClick={() => setPage('upload')}
            >
              📤 Upload
            </motion.button>
            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              className={`nav-button ${page === 'calls' ? 'active' : ''}`}
              onClick={() => setPage('calls')}
            >
              📋 Calls
            </motion.button>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {page === 'upload' ? (
          <motion.div
            key="upload"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={pageTransition}
          >
            <Upload />
          </motion.div>
        ) : (
          <motion.div
            key="calls"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={pageTransition}
          >
            <Calls />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App

