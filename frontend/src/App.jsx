import { Route,Routes } from "react-router-dom"
import Schemes from "./pages/Schemes"
import SchemeDetails from "./pages/SchemeDetails"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import MainLayout from "./pages/layouts/MainLayout"

function App(){

  return (
    <div>

     
      <Routes>
        <Route element={<MainLayout/>}>
        <Route path="" element={<Home/>}/>
        <Route path="/schemes/" element={<Schemes/>}/>
        <Route path="schemes/:id" element={<SchemeDetails/>}/>
        </Route>
        <Route  path="login/" element={<Login/>} />
        <Route  path="register/" element={<Register/>} />
      </Routes>
    </div>
  )
}
export default App