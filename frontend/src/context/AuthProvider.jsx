import { api } from "../services/client";
import { createContext, useEffect, useState } from "react";
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

    function clearSession(){
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
        setToken(null)
    }

    
    useEffect(() => {
        window.addEventListener("grammitra-session-ended", clearSession);
        return () => window.removeEventListener("grammitra-session-ended", clearSession);
    }, []);
    useEffect(() => {
        let active = true;
        if (token) api.get("accounts/profileEdit").then(({data}) => {
            if (active) setUser(data);
        }).catch(() => {});
        return () => { active = false; };
    }, [token]);
    useEffect(() => {
        if (user) localStorage.setItem("user", JSON.stringify(user));
    }, [user]);
    async function LogoutUser() {
        await api.post("accounts/logout");
        clearSession();
    }
return (
 < AuthContext.Provider value={{user,token,setUser,LoginUser,LogoutUser,IsAuthenticated}}>
   {children}
  </AuthContext.Provider>
)
}
export default AuthProvider;