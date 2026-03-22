import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.tsx";
import ProtectedRoute from "./components/ProtectedRoutes.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Transactions from "./pages/Transactions.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>

<Dashboard/>
                        </ProtectedRoute>
                    }
                />
                <Route
                path={"/transactions"}
                element={
                    <ProtectedRoute>
                        <Transactions/>
                    </ProtectedRoute>
                }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;