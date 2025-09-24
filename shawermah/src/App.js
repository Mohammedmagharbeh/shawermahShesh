import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './componenet/Home';
import Login from './componenet/log';
import Registration from './componenet/Registration';
function App() {
  return (
    <div className="App">
      
      <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Registration" element={<Registration />} />

      </Routes>      
      </BrowserRouter>


    </div>
  );
}

export default App;
