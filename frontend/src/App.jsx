import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Home from './componenet/Home';
import Login from './componenet/log';
import Registration from './componenet/Registration';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
 <div className="App">
      
      <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home/>} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Registration" element={<Registration />} />

      </Routes>      
      </BrowserRouter>


    </div>    </>
  )
}

export default App
