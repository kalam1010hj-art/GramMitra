import { Route,Routes } from "react-router-dom"
import Schemes from "./pages/Schemes"
import SchemeDetails from "./pages/SchemeDetails"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import MainLayout from "./pages/layouts/MainLayout"
import Notices from "./pages/Notices"
import NoticeDetails from "./pages/NoticeDetails"
import EditProfile from "./pages/EditProfile"

function App(){

  return (
    <div>

     
      <Routes>
        <Route element={<MainLayout/>}>
        <Route path="" element={<Home/>}/>
        <Route path="/schemes/" element={<Schemes/>}/>
        <Route path="schemes/:id" element={<SchemeDetails/>}/>
        <Route path="/notices" element={<Notices/>}/>
        <Route path="/notices/:id" element={<NoticeDetails/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/profile/edit" element={<EditProfile/>}/>
        </Route>
        <Route  path="login/" element={<Login/>} />
        <Route  path="register/" element={<Register/>} />
      </Routes>
    </div>
  )
}
export default App