import { BrowserRouter, Routes, Route } from "react-router-dom"
import Homepage from "./Pages/Homepage"
import DropPage from "./Pages/DropPage"
import { useState } from "react"
import GestureDetector from "./Components/GestureDetector"

function App() {

  const [currentGesture, setCurrentGesture] = useState(null)
  const [gestureConfidence, setGestureConfidence] = useState(0)

  const handleGesture =  (gesture, confidence) => {
    setCurrentGesture(gesture);
    setGestureConfidence(confidence)

  }

  return (
    <>
    <BrowserRouter>
    <GestureDetector onGesture={handleGesture}/>
    <Routes>
      <Route path="/" element={<Homepage currentGesture={currentGesture} gestureConfidence={gestureConfidence}/> } />
      <Route path="/drop" element={<DropPage currentGesture={currentGesture} gestureConfidence={gestureConfidence}/>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
