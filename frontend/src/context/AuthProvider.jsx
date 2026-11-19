import { createContext, useState } from "react";
export const AuthContext = createContext()

function AuthProvider({children}){
    let [user,setUser]= useState(()=>{
        try {
        const storedUser = localStorage.getItem("user");

        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        localStorage.removeItem("user");
        return null;
    }
    })
    let [token,setToken] = useState(()=>{
        return localStorage.getItem("token")
    })

    let IsAuthenticated = Boolean(token)

    function LoginUser(token,user){
        localStorage.setItem("token",token)
        localStorage.setItem("user",JSON.stringify(user)
        )
        setToken(token)
        setUser(user)
    }

    function LogoutUser(){
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
        setToken(null)
    }

    
return (
 < AuthContext.Provider value={{user,token,setUser,LoginUser,LogoutUser,IsAuthenticated}}>
   {children}
  </AuthContext.Provider>
)
}
export default AuthProvider;