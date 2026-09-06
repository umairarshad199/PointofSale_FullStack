import { useEffect, useState } from "react";
import api from "../services/api";

function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptToDelete, setReceiptToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const role = localStorage.getItem("role") || "User";
  const isAdmin = role === "Admin";

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/Receipts");

      setReceipts(response.data);
    } catch (error) {
      console.error("Error loading receipts:", error);

      if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to load receipts. Make sure the ASP.NET Core API is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGrandTotal = (content) => {
    const match = content.match(
      /Grand Total:\s*(?:Rs|PKR|\$)?\s*([\d,.]+)/
    );

    if (!match) {
      return "Rs 0.00";
    }

    const amount = Number(
      match[1].replace(/,/g, "")
    );

    return `Rs ${amount.toFixed(2)}`;
  };

  const getItemCount = (content) => {
    const lines = content
      .split("\n")
      .filter((line) => {
        const trimmedLine = line.trim();

        return (
          trimmedLine &&
          !trimmedLine.startsWith("=") &&
          !trimmedLine.startsWith("-") &&
          !trimmedLine.startsWith("QuickStop") &&
          !trimmedLine.startsWith("Subtotal") &&
          !trimmedLine.startsWith("Tax") &&
          !trimmedLine.startsWith("Grand Total") &&
          !trimmedLine.startsWith("Thank you")
        );
      });

    return lines.length;
  };

  /*
   * Receipts are displayed newest first,
   * but receipt numbers are assigned chronologically.
   */

  const getDisplayReceiptNumber = (receipt) => {
    const chronologicalReceipts = [...receipts].sort(
      (a, b) =>
        new Date(a.createdAt) -
        new Date(b.createdAt)
    );

    const index =
      chronologicalReceipts.findIndex(
        (item) => item.id === receipt.id
      );

    return index + 1;
  };

  /*
   * =========================================================
   * ADMIN RECEIPT REMOVAL
   * =========================================================
   */

  const openDeleteConfirmation = (receipt) => {
    setReceiptToDelete(receipt);
  };

  const closeDeleteConfirmation = () => {
    if (!deleting) {
      setReceiptToDelete(null);
    }
  };

  const handleDeleteReceipt = async () => {
    if (!receiptToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await api.delete(
        `/Receipts/${receiptToDelete.id}`
      );

      /*
       * Remove the receipt from the current Admin
       * screen immediately.
       */
      setReceipts((currentReceipts) =>
        currentReceipts.filter(
          (receipt) =>
            receipt.id !== receiptToDelete.id
        )
      );

      setReceiptToDelete(null);

    } catch (error) {
      console.error(
        "Error removing receipt:",
        error
      );

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to remove receipts."
        );
      } else if (error.response?.status === 404) {
        setError(
          "Receipt was not found."
        );
      } else if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Unable to remove receipt."
        );
      } else {
        setError(
          "Unable to remove receipt. Make sure the ASP.NET Core API is running."
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="receipts-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="receipts-header">

        <div>
          <span className="section-label">
            TRANSACTIONS
          </span>

          <h2>
            Receipts
          </h2>

          <p>
            View your previous sales and receipts.
          </p>
        </div>

        <div className="receipts-count">
          <strong>
            {receipts.length}
          </strong>

          <span>
            {receipts.length === 1
              ? "Receipt"
              : "Receipts"}
          </span>
        </div>

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
            Loading receipts...
          </span>

        </div>
      )}

      {/* =====================================================
          EMPTY
          ===================================================== */}

      {!loading && receipts.length === 0 && (
        <div className="receipts-empty">

          <div className="receipts-empty-icon">
            🧾
          </div>

          <h3>
            No receipts yet
          </h3>

          <p>
            Completed sales will appear here.
          </p>

        </div>
      )}

      {/* =====================================================
          RECEIPT LIST
          ===================================================== */}

      {!loading && receipts.length > 0 && (
        <div className="receipts-list">

          {receipts.map((receipt) => {

            const itemCount =
              getItemCount(receipt.content);

            return (
              <div
                className="receipt-list-card"
                key={receipt.id}
              >

                {/* LEFT SIDE */}

                <div className="receipt-card-left">

                  <div className="receipt-list-icon">
                    🧾
                  </div>

                  <div className="receipt-list-info">

                    <div className="receipt-title-row">

                      <h3>
                        Receipt #
                        {getDisplayReceiptNumber(
                          receipt
                        )}
                      </h3>

                      <span className="receipt-status processed">
                        Processed
                      </span>

                    </div>

                    <div className="receipt-meta">

                      <span>
                        {receipt.userName}
                      </span>

                      <span>
                        •
                      </span>

                      <span>
                        {formatDate(
                          receipt.createdAt
                        )}
                      </span>

                      <span>
                        •
                      </span>

                      <span>
                        {formatTime(
                          receipt.createdAt
                        )}
                      </span>

                    </div>

                  </div>

                </div>

                {/* RIGHT SIDE */}

                <div className="receipt-card-right">

                  <div className="receipt-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      {getGrandTotal(
                        receipt.content
                      )}
                    </strong>

                  </div>

                  <div className="receipt-items-count">

                    {itemCount}{" "}

                    {itemCount === 1
                      ? "item"
                      : "items"}

                  </div>

                  <button
                    type="button"
                    className="receipt-view-button"
                    onClick={() =>
                      setSelectedReceipt(
                        receipt
                      )
                    }
                  >
                    View Receipt

                    <span>
                      →
                    </span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      className="receipt-delete-button"
                      onClick={() =>
                        openDeleteConfirmation(
                          receipt
                        )
                      }
                      title="Remove receipt from Admin list"
                    >
                      <span>
                        🗑
                      </span>
                    </button>
                  )}

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* =====================================================
          VIEW RECEIPT MODAL
          ===================================================== */}

      {selectedReceipt && (
        <div
          className="receipt-modal-overlay"
          onClick={() =>
            setSelectedReceipt(null)
          }
        >

          <div
            className="receipt-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="receipt-modal-header">

              <div>

                <span className="section-label">
                  RECEIPT
                </span>

                <h3>
                  Receipt #
                  {getDisplayReceiptNumber(
                    selectedReceipt
                  )}
                </h3>

              </div>

              <button
                type="button"
                className="receipt-modal-close"
                onClick={() =>
                  setSelectedReceipt(null)
                }
              >
                ×
              </button>

            </div>

            <div className="receipt-modal-meta">

              <div>
                <span>
                  Customer
                </span>

                <strong>
                  {selectedReceipt.userName}
                </strong>
              </div>

              <div>
                <span>
                  Date
                </span>

                <strong>
                  {formatDate(
                    selectedReceipt.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Time
                </span>

                <strong>
                  {formatTime(
                    selectedReceipt.createdAt
                  )}
                </strong>
              </div>

            </div>

            <div className="receipt-modal-content">

              <pre>
                {selectedReceipt.content}
              </pre>

            </div>

            <div className="receipt-modal-footer">

              <span>
                Grand Total
              </span>

              <strong>
                {getGrandTotal(
                  selectedReceipt.content
                )}
              </strong>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
          ===================================================== */}

      {receiptToDelete && (
        <div
          className="receipt-delete-modal-overlay"
          onClick={closeDeleteConfirmation}
        >

          <div
            className="receipt-delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="receipt-delete-icon">
              🗑
            </div>

            <h3>
              Remove Receipt?
            </h3>

            <p>
              Are you sure you want to remove Receipt #
              {getDisplayReceiptNumber(receiptToDelete)}?</p>

            <div className="receipt-delete-actions">

              <button
                type="button"
                className="receipt-cancel-button"
                onClick={closeDeleteConfirmation}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="receipt-confirm-delete-button"
                onClick={handleDeleteReceipt}
                disabled={deleting}
              >
                {deleting
                  ? "Removing..."
                  : "Remove Receipt"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Receipts;