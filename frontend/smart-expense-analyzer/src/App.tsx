import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppearanceProvider } from "./context/AppearanceContext";
import Login from "./pages/Login.tsx";
import ProtectedRoute from "./components/ProtectedRoutes.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Transactions from "./pages/Transactions.tsx";
import Analytics from "./pages/Analytics.tsx";
import Budgets from "./pages/Budgets.tsx";
import Insights from "./pages/Insights.tsx";
import Settings from "./pages/Settings.tsx";

function App() {
    return (
        <AppearanceProvider>
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
                <Route
                path={"/analytics"}
                element={
                    <ProtectedRoute>
                        <Analytics/>
                    </ProtectedRoute>
                }
                />
                <Route
                path={"/budgets"}
                element={
                    <ProtectedRoute>
                        <Budgets/>
                    </ProtectedRoute>
                }
                />
                <Route
                path={"/insights"}
                element={
                    <ProtectedRoute>
                        <Insights/>
                    </ProtectedRoute>
                }
                />
                <Route
                path={"/settings"}
                element={
                    <ProtectedRoute>
                        <Settings/>
                    </ProtectedRoute>
                }
                />
            </Routes>
        </BrowserRouter>
        </AppearanceProvider>
    );
}

export default App;