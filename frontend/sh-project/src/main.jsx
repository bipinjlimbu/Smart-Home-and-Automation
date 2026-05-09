import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Lightbulb } from 'lucide-react'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-blue-500">
        Tailwind v3 Working <Lightbulb className="inline-block w-6 h-6 ml-2 text-yellow-500" />
      </h1>
    </div>
  </StrictMode>,
)
