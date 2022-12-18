import { useState } from 'react'
import PdfCreate from './PdfCreate'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
       Made by @ Shahid
      <PdfCreate />
     
      </div>
  )
}

export default App
