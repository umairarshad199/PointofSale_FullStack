import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    grandTotal: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [removingProduct, setRemovingProduct] = useState(null);
  const [undoing, setUndoing] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const [cartResponse, totalsResponse] = await Promise.all([
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
      console.error("Error loading cart:", error);

      if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to load your cart. Make sure the ASP.NET Core API is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setRemovingProduct(productId);
      setError("");

      await api.delete(`/Sales/items/${productId}`);

      await loadCart();
    } catch (error) {
      console.error("Error removing item:", error);

      if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Unable to remove item."
        );
      } else {
        setError("Unable to remove item.");
      }
    } finally {
      setRemovingProduct(null);
    }
  };

  const handleUndo = async () => {
    try {
      setUndoing(true);
      setError("");

      await api.post("/Sales/undo");

      await loadCart();
    } catch (error) {
      console.error("Error undoing action:", error);

      if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Nothing to undo."
        );
      } else {
        setError("Nothing to undo.");
      }
    } finally {
      setUndoing(false);
    }
  };

  const formatMoney = (value) => {
    return `$${Number(value).toFixed(2)}`;
  };

  return (
    <div className="cart-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="cart-header">

        <div>

          <span className="section-label">
            CURRENT SALE
          </span>

          <h2>
            Shopping Cart
          </h2>

          <p>
            Review your items before checkout.
          </p>

        </div>

        <button
          type="button"
          className="cart-continue-button"
          onClick={() => navigate("/products")}
        >
          ← Continue Shopping
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="products-error">
          {error}
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="products-message">

          <div className="loading-spinner"></div>

          <span>
            Loading cart...
          </span>

        </div>
      )}

      {/* =====================================================
          EMPTY CART
      ===================================================== */}

      {!loading && cart.length === 0 && (

        <div className="cart-empty">

          <div className="cart-empty-icon">
            🛒
          </div>

          <h3>
            Your cart is empty
          </h3>

          <p>
            Add some products to start a new sale.
          </p>

          <button
            type="button"
            className="cart-shop-button"
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>

        </div>

      )}

      {/* =====================================================
          CART CONTENT
      ===================================================== */}

      {!loading && cart.length > 0 && (

        <div className="cart-layout">

          {/* =================================================
              CART ITEMS
          ================================================= */}

          <div className="cart-items-section">

            <div className="cart-section-header">

              <div>

                <h3>
                  Cart Items
                </h3>

                <span>
                  {cart.length} product
                  {cart.length !== 1 ? "s" : ""}
                </span>

              </div>

              <button
                type="button"
                className="cart-undo-button"
                onClick={handleUndo}
                disabled={undoing}
              >
                {undoing
                  ? "Undoing..."
                  : "↶ Undo Last Add"}
              </button>

            </div>

            <div className="cart-items">

              {cart.map((item) => (

                <div
                  className="cart-item"
                  key={item.productId}
                >

                  <div className="cart-item-icon">
                    {item.productName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="cart-item-info">

                    <h4>
                      {item.productName}
                    </h4>

                    <span>
                      {formatMoney(item.price)} per unit
                    </span>

                  </div>

                  <div className="cart-item-quantity">

                    <span className="cart-quantity-label">
                      Qty
                    </span>

                    <strong>
                      {item.quantity}
                    </strong>

                  </div>

                  <div className="cart-item-total">

                    <strong>
                      {formatMoney(item.lineTotal)}
                    </strong>

                  </div>

                  <button
                    type="button"
                    className="cart-remove-button"
                    onClick={() =>
                      handleRemoveItem(item.productId)
                    }
                    disabled={
                      removingProduct === item.productId
                    }
                    title="Remove item"
                  >
                    {removingProduct === item.productId
                      ? "..."
                      : "×"}
                  </button>

                </div>

              ))}

            </div>

          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <div className="cart-summary">

            <div className="cart-summary-header">

              <span className="section-label">
                ORDER SUMMARY
              </span>

              <h3>
                Sale Total
              </h3>

            </div>

            <div className="cart-summary-lines">

              <div className="cart-summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  {formatMoney(totals.subtotal)}
                </strong>

              </div>

              <div className="cart-summary-row">

                <span>
                  Tax
                </span>

                <strong>
                  {formatMoney(totals.tax)}
                </strong>

              </div>

            </div>

            <div className="cart-summary-total">

              <span>
                Grand Total
              </span>

              <strong>
                {formatMoney(totals.grandTotal)}
              </strong>

            </div>

            {/* =================================================
                PROCEED TO CHECKOUT
            ================================================= */}

            <button
              type="button"
              className="cart-checkout-button"
              onClick={() =>
                navigate("/sales", {
                  state: {
                    fromCart: true,
                  },
                })
              }
            >
              Proceed to Checkout
              <span>→</span>
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Cart;