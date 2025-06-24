import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectRoute(){
    const { isAuthenticated, isLoading } = useAuth()

    if(isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>
    }

    return isAuthenticated ? <Outlet/> : <Navigate to='/login' replace/>
}