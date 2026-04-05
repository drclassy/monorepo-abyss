// Claudesy Transformer Engine V2 — Extension Sidepanel Entry
import React from 'react'
import ReactDOM from 'react-dom/client'
import { OptimizerPanel } from '../../components/OptimizerPanel'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OptimizerPanel />
  </React.StrictMode>,
)
