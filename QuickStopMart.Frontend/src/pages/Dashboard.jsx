import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "User";
  const userName = localStorage.getItem("userName") || "User";

  const isAdmin = role === "Admin";

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint = isAdmin
        ? "/Dashboard/admin"
        : "/Dashboard/user";

      const response = await api.get(endpoint);

      setDashboard(response.data);
    } catch (err) {
      console.error("Dashboard error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view this dashboard."
        );
      } else {
        setError(
          err.response?.data ||
            "Unable to load dashboard data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return `$${Number(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  const getPurchaseItems = (content) => {
    if (!content) return [];

    const lines = content.split("\n");

    return lines
      .filter(
        (line) =>
          line.includes(" @ ") &&
          line.includes(" = ")
      )
      .map((line) => line.trim());
  };

  const currentDate = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  // LOADING
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <div className="dashboard-error-icon">
            !
          </div>

          <h2>
            Unable to load dashboard
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="dashboard-retry-button"
            onClick={loadDashboard}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  if (isAdmin) {
    return (
      <div className="dashboard-page">

        {/* HEADER */}
        <div className="dashboard-header">

          <div>
            <p className="dashboard-eyebrow">
              ADMINISTRATOR
            </p>

            <h1>
              Welcome back, {userName}
            </h1>

            <p className="dashboard-subtitle">
              Here's what's happening at QuickStop Mart today.
            </p>
          </div>

          <div className="dashboard-date">
            {currentDate}
          </div>

        </div>

        {/* STAT CARDS */}
        <div className="dashboard-stat-grid">

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              ▦
            </div>

            <div className="dashboard-stat-content">
              <span>Total Products</span>

              <strong>
                {dashboard.totalProducts}
              </strong>

              <small>
                Products in catalog
              </small>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              ◈
            </div>

            <div className="dashboard-stat-content">
              <span>Inventory Units</span>

              <strong>
                {dashboard.totalInventoryUnits}
              </strong>

              <small>
                Units currently in stock
              </small>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              ◷
            </div>

            <div className="dashboard-stat-content">
              <span>Total Sales</span>

              <strong>
                {dashboard.totalSales}
              </strong>

              <small>
                Completed transactions
              </small>
            </div>
          </div>

          <div className="dashboard-stat-card dashboard-revenue-card">
            <div className="dashboard-stat-icon">
              $
            </div>

            <div className="dashboard-stat-content">
              <span>Total Revenue</span>

              <strong>
                {formatMoney(
                  dashboard.totalRevenue
                )}
              </strong>

              <small>
                From completed sales
              </small>
            </div>
          </div>

        </div>

        {/* LOW STOCK */}
        <div className="dashboard-panel dashboard-low-stock-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>
                Low Stock
              </h2>

              <p>
                Products that need attention
              </p>
            </div>

            <button
              type="button"
              className="dashboard-view-button"
              onClick={() => navigate("/products")}
            >
              Products
            </button>

          </div>

          {dashboard.lowStockProducts?.length > 0 ? (

            <div className="dashboard-list">

              {dashboard.lowStockProducts.map(
                (product) => (

                  <div
                    className="dashboard-list-item"
                    key={product.id}
                  >

                    <div className="dashboard-product-icon">
                      ▦
                    </div>

                    <div className="dashboard-list-info">

                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        {product.category}
                      </span>

                    </div>

                    <div className="dashboard-stock-warning">

                      <strong>
                        {product.quantity}
                      </strong>

                      <span>
                        left
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="dashboard-empty">

              <span>
                ✓
              </span>

              <p>
                All products have healthy stock levels.
              </p>

            </div>

          )}

        </div>

        {/* BEST-SELLING PRODUCTS */}
        <div className="dashboard-panel dashboard-best-selling-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>
                Best-Selling Products
              </h2>

              <p>
                Products with the highest number of units sold
              </p>
            </div>

            <button
              type="button"
              className="dashboard-view-button"
              onClick={() => navigate("/products")}
            >
              Products
            </button>

          </div>

          {dashboard.bestSellingProducts?.length > 0 ? (

            <div className="dashboard-best-selling-grid">

              {dashboard.bestSellingProducts.map(
                (product, index) => (

                  <div
                    className="dashboard-best-selling-card"
                    key={product.productId}
                  >

                    <div className="dashboard-ranking">
                      #{index + 1}
                    </div>

                    <div className="dashboard-best-selling-icon">
                      ▦
                    </div>

                    <div className="dashboard-best-selling-info">

                      <strong>
                        {product.productName}
                      </strong>

                      <span>
                        {product.category}
                      </span>

                    </div>

                    <div className="dashboard-best-selling-stats">

                      <strong>
                        {product.unitsSold}
                      </strong>

                      <span>
                        units sold
                      </span>

                      <small>
                        {formatMoney(
                          product.revenue
                        )}
                      </small>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="dashboard-empty">

              <span>
                ▦
              </span>

              <p>
                No sales data available yet.
              </p>

            </div>

          )}

        </div>

      </div>
    );
  }

  // =====================================================
  // USER DASHBOARD
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* HEADER */}
      <div className="dashboard-header">

        <div>
          <p className="dashboard-eyebrow">
            CUSTOMER DASHBOARD
          </p>

          <h1>
            Welcome back, {userName}
          </h1>

          <p className="dashboard-subtitle">
            Browse products, manage your cart, and track your purchases.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-primary-button"
          onClick={() => navigate("/products")}
        >
          <span>▦</span>
          Browse Products
        </button>

      </div>

      {/* USER STAT CARDS */}
      <div className="dashboard-stat-grid">

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon">
            ▦
          </div>

          <div className="dashboard-stat-content">

            <span>
              Available Products
            </span>

            <strong>
              {dashboard.availableProducts}
            </strong>

            <small>
              Products currently in stock
            </small>

          </div>

        </div>

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon">
            ◷
          </div>

          <div className="dashboard-stat-content">

            <span>
              My Purchases
            </span>

            <strong>
              {dashboard.myPurchases}
            </strong>

            <small>
              Completed purchases
            </small>

          </div>

        </div>

        <div className="dashboard-stat-card dashboard-revenue-card">

          <div className="dashboard-stat-icon">
            $
          </div>

          <div className="dashboard-stat-content">

            <span>
              Total Spending
            </span>

            <strong>
              {formatMoney(
                dashboard.myTotalSpending
              )}
            </strong>

            <small>
              Total amount spent
            </small>

          </div>

        </div>

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon">
            🛒
          </div>

          <div className="dashboard-stat-content">

            <span>
              Shopping
            </span>

            <strong>
              Ready
            </strong>

            <small>
              Start a new purchase
            </small>

          </div>

        </div>

      </div>

      {/* RECENT PURCHASES */}
      <div className="dashboard-panel dashboard-recent-purchases-panel">

        <div className="dashboard-panel-header">

          <div>
            <h2>
              Recent Purchases
            </h2>

            <p>
              Products from your latest purchases
            </p>
          </div>

          <button
            type="button"
            className="dashboard-view-button"
            onClick={() => navigate("/receipts")}
          >
            View Receipts
          </button>

        </div>

        {dashboard.recentPurchases?.length > 0 ? (

          <div className="dashboard-purchases-list">

            {dashboard.recentPurchases.map(
              (purchase) => {

                const items =
                  getPurchaseItems(
                    purchase.items
                  );

                return (
                  <div
                    className="dashboard-purchase-item"
                    key={purchase.id}
                  >

                    <div className="dashboard-purchase-icon">
                      🛒
                    </div>

                    <div className="dashboard-purchase-info">

                      <strong>
                        {items.length > 0
                          ? items
                              .map(
                                (item) =>
                                  item.split(" x ")[0]
                              )
                              .join(", ")
                          : "Purchase"}
                      </strong>

                      <span>
                        {items.length > 0
                          ? `${items.length} ${
                              items.length === 1
                                ? "item"
                                : "items"
                            }`
                          : "Completed purchase"}
                      </span>

                      <small>
                        {formatDate(
                          purchase.createdAt
                        )}
                      </small>

                    </div>

                    <div className="dashboard-purchase-amount">

                      <strong>
                        {formatMoney(
                          purchase.grandTotal
                        )}
                      </strong>

                      <span>
                        Total
                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        ) : (

          <div className="dashboard-empty">

            <span>
              🛒
            </span>

            <p>
              You haven't made any purchases yet.
            </p>

            <button
              type="button"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>

          </div>

        )}

      </div>

      {/* BEST-SELLING PRODUCTS */}
      <div className="dashboard-panel dashboard-best-selling-panel">

        <div className="dashboard-panel-header">

          <div>
            <h2>
              Best-Selling Products
            </h2>

            <p>
              Popular products at QuickStop Mart
            </p>
          </div>

          <button
            type="button"
            className="dashboard-view-button"
            onClick={() => navigate("/products")}
          >
            Shop Products
          </button>

        </div>

        {dashboard.bestSellingProducts?.length > 0 ? (

          <div className="dashboard-best-selling-grid">

            {dashboard.bestSellingProducts.map(
              (product, index) => (

                <div
                  className="dashboard-best-selling-card"
                  key={product.productId}
                >

                  <div className="dashboard-ranking">
                    #{index + 1}
                  </div>

                  <div className="dashboard-best-selling-icon">
                    ▦
                  </div>

                  <div className="dashboard-best-selling-info">

                    <strong>
                      {product.productName}
                    </strong>

                    <span>
                      {product.category}
                    </span>

                  </div>

                  <div className="dashboard-best-selling-stats">

                    <strong>
                      {product.unitsSold}
                    </strong>

                    <span>
                      units sold
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="dashboard-empty">

            <span>
              ▦
            </span>

            <p>
              No popular products yet.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default Dashboard;