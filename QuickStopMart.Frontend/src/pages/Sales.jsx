import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import api from "../services/api";

function Sales() {
  const location = useLocation();
  const navigate = useNavigate();

  const cameFromCart =
    location.state?.fromCart === true;

  const [cart, setCart] = useState([]);

  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    grandTotal: 0,
  });

  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const [removingProduct, setRemovingProduct] =
    useState(null);

  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");

  /*
   * =========================================================
   * LOAD SALE ONLY AFTER PROCEED TO CHECKOUT
   * =========================================================
   */

  useEffect(() => {
    if (!cameFromCart) {
      setCart([]);

      setTotals({
        subtotal: 0,
        tax: 0,
        grandTotal: 0,
      });

      setLoading(false);

      return;
    }

    loadSale();
  }, [cameFromCart]);

  /*
   * =========================================================
   * LOAD CART + TOTALS
   * =========================================================
   */

  const loadSale = async () => {
    try {
      setLoading(true);
      setError("");

      const [cartResponse, totalsResponse] =
        await Promise.all([
          api.get("/Sales/cart"),
          api.get("/Sales/totals"),
        ]);

      setCart(cartResponse.data);

      setTotals({
        subtotal:
          Number(totalsResponse.data.subtotal) || 0,

        tax:
          Number(totalsResponse.data.tax) || 0,

        grandTotal:
          Number(totalsResponse.data.grandTotal) || 0,
      });

    } catch (error) {
      console.error(
        "Error loading sale:",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to load the current sale. Make sure the ASP.NET Core API is running."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * REMOVE PRODUCT FROM SALE
   * =========================================================
   */

  const handleRemoveItem = async (productId) => {
    try {
      setRemovingProduct(productId);
      setError("");

      await api.delete(
        `/Sales/items/${productId}`
      );

      await loadSale();

    } catch (error) {
      console.error(
        "Error removing item:",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Unable to remove item."
        );
      } else {
        setError(
          "Unable to remove item."
        );
      }

    } finally {
      setRemovingProduct(null);
    }
  };

  /*
   * =========================================================
   * COMPLETE CHECKOUT
   * =========================================================
   */

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError(
        "Your cart is empty."
      );

      return;
    }

    try {
      setCheckingOut(true);
      setError("");

      const response =
        await api.post("/Sales/checkout");

      setReceipt(
        response.data.receipt
      );

    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Unable to complete checkout."
        );
      } else {
        setError(
          "Unable to complete checkout. Make sure the ASP.NET Core API is running."
        );
      }

    } finally {
      setCheckingOut(false);
    }
  };

  /*
   * =========================================================
   * FORMAT MONEY
   * =========================================================
   */

  const formatMoney = (value) => {
    return `$${Number(value).toFixed(2)}`;
  };

  /*
   * =========================================================
   * RECEIPT SCREEN
   * =========================================================
   */

  if (receipt) {
    return (
      <div className="sales-page">

        <div className="checkout-success">

          <div className="success-icon">
            ✓
          </div>

          <span className="section-label">
            SALE COMPLETED
          </span>

          <h2>
            Payment Successful
          </h2>

          <p>
            Your sale has been completed successfully.
          </p>

          <div className="receipt-card">

            <div className="receipt-header">

              <div>

                <span className="receipt-store-name">
                  QuickStop Mart
                </span>

                <span className="receipt-subtitle">
                  Official Sales Receipt
                </span>

              </div>

              <span className="receipt-check">
                ✓ PAID
              </span>

            </div>

            <pre className="receipt-content">
              {receipt}
            </pre>

          </div>

          <div className="checkout-success-actions">

            <button
              type="button"
              className="sales-secondary-button"
              onClick={() =>
                navigate("/products")
              }
            >
              Continue Shopping
            </button>

            <button
              type="button"
              className="sales-primary-button"
              onClick={() =>
                navigate("/receipts")
              }
            >
              View Receipts
              <span>→</span>
            </button>

          </div>

        </div>

      </div>
    );
  }

  /*
   * =========================================================
   * SALES PAGE WITHOUT CHECKOUT
   * =========================================================
   */

  if (!cameFromCart) {
    return (
      <div className="sales-page">

        <div className="sales-header">

          <div>

            <span className="section-label">
              SALES
            </span>

            <h2>
              Sales
            </h2>

            <p>
              Start a sale by adding products to your cart.
            </p>

          </div>

          <button
            type="button"
            className="cart-continue-button"
            onClick={() =>
              navigate("/cart")
            }
          >
            View Cart →
          </button>

        </div>

        <div className="cart-empty">

          <div className="cart-empty-icon">
            🛒
          </div>

          <h3>
            No sale ready for checkout
          </h3>

          <p>
            Add products to your cart first, then click
            Proceed to Checkout.
          </p>

          <button
            type="button"
            className="cart-shop-button"
            onClick={() =>
              navigate("/products")
            }
          >
            Browse Products
          </button>

        </div>

      </div>
    );
  }

  /*
   * =========================================================
   * CHECKOUT PAGE
   * =========================================================
   */

  return (
    <div className="sales-page">

      <div className="sales-header">

        <div>

          <span className="section-label">
            CHECKOUT
          </span>

          <h2>
            Complete Sale
          </h2>

          <p>
            Review the current sale and complete checkout.
          </p>

        </div>

        <button
          type="button"
          className="cart-continue-button"
          onClick={() =>
            navigate("/cart")
          }
        >
          ← Back to Cart
        </button>

      </div>

      {error && (
        <div className="products-error">
          {error}
        </div>
      )}

      {loading && (
        <div className="products-message">

          <div className="loading-spinner"></div>

          <span>
            Loading sale...
          </span>

        </div>
      )}

      {!loading && cart.length === 0 && (

        <div className="cart-empty">

          <div className="cart-empty-icon">
            🛒
          </div>

          <h3>
            No items to checkout
          </h3>

          <p>
            Add some products to your cart before
            completing a sale.
          </p>

          <button
            type="button"
            className="cart-shop-button"
            onClick={() =>
              navigate("/products")
            }
          >
            Browse Products
          </button>

        </div>

      )}

      {!loading && cart.length > 0 && (

        <div className="sales-layout">

          {/* =================================================
              ORDER ITEMS
          ================================================= */}

          <div className="sales-items-card">

            <div className="sales-card-header">

              <div>

                <span className="section-label">
                  ITEMS
                </span>

                <h3>
                  Order Details
                </h3>

              </div>

              <span className="sales-item-count">
                {cart.length} product
                {cart.length !== 1
                  ? "s"
                  : ""}
              </span>

            </div>

            <div className="sales-items">

              {cart.map((item) => (

                <div
                  className="sales-item"
                  key={item.productId}
                >

                  <div className="sales-item-icon">
                    {item.productName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="sales-item-info">

                    <strong>
                      {item.productName}
                    </strong>

                    <span>
                      {formatMoney(item.price)}
                      {" × "}
                      {item.quantity}
                    </span>

                  </div>

                  <strong className="sales-item-total">
                    {formatMoney(
                      item.lineTotal
                    )}
                  </strong>

                  {/* REMOVE BUTTON */}

                  <button
                    type="button"
                    className="sales-remove-button"
                    onClick={() =>
                      handleRemoveItem(
                        item.productId
                      )
                    }
                    disabled={
                      removingProduct ===
                      item.productId
                    }
                    title="Remove item"
                  >
                    {removingProduct ===
                    item.productId
                      ? "..."
                      : "×"}
                  </button>

                </div>

              ))}

            </div>

          </div>

          {/* =================================================
              PAYMENT SUMMARY
          ================================================= */}

          <div className="sales-payment-card">

            <div className="sales-card-header">

              <div>

                <span className="section-label">
                  PAYMENT
                </span>

                <h3>
                  Order Summary
                </h3>

              </div>

            </div>

            <div className="sales-summary">

              <div className="sales-summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  {formatMoney(
                    totals.subtotal
                  )}
                </strong>

              </div>

              <div className="sales-summary-row">

                <span>
                  Tax
                </span>

                <strong>
                  {formatMoney(
                    totals.tax
                  )}
                </strong>

              </div>

            </div>

            <div className="sales-grand-total">

              <span>
                Total to Pay
              </span>

              <strong>
                {formatMoney(
                  totals.grandTotal
                )}
              </strong>

            </div>

            <div className="payment-method">

              <span className="payment-method-icon">
                $
              </span>

              <div>

                <strong>
                  Cash Payment
                </strong>

                <span>
                  Pay at the counter
                </span>

              </div>

              <span className="payment-selected">
                ✓
              </span>

            </div>

            <button
              type="button"
              className="complete-sale-button"
              onClick={handleCheckout}
              disabled={checkingOut}
            >

              {checkingOut
                ? "Processing Sale..."
                : "Complete Sale"}

              {!checkingOut && (
                <span>
                  →
                </span>
              )}

            </button>

            <p className="checkout-note">
              By completing this sale, inventory will
              be updated automatically.
            </p>

          </div>

        </div>

      )}

    </div>
  );
}

export default Sales;