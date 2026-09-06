import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Sales from "./pages/Sales";
import Receipts from "./pages/Receipts";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            LOGIN
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =========================
            PROTECTED APPLICATION
        ========================= */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/*"
            element={
              <div className="app-layout">

                <Sidebar />

                <div className="main-area">

                  <main className="page-content">

                    <Routes>

                      <Route
                        path="/"
                        element={<Dashboard />}
                      />

                      <Route
                        path="/products"
                        element={<Products />}
                      />

                      <Route
                        path="/cart"
                        element={<Cart />}
                      />

                      <Route
                        path="/sales"
                        element={<Sales />}
                      />

                      <Route
                        path="/receipts"
                        element={<Receipts />}
                      />

                    </Routes>

                  </main>

                </div>

              </div>
            }
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;