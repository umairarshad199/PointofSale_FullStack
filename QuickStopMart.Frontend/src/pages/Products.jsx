import { useEffect, useState } from "react";
import api from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [addingProduct, setAddingProduct] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);

  const [addingToCart, setAddingToCart] = useState(null);

  const [cartQuantities, setCartQuantities] = useState({});

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    quantity: "",
  });

  const [editingProduct, setEditingProduct] = useState({
    id: null,
    name: "",
    price: "",
    category: "",
    quantity: "",
  });

  const [productToDelete, setProductToDelete] = useState(null);

  const role = localStorage.getItem("role") || "User";
  const isAdmin = role === "Admin";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/Products");

      setProducts(response.data);
    } catch (error) {
      console.error("Error loading products:", error);

      if (error.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (error.response?.status === 403) {
        setError("You are not authorized to view products.");
      } else {
        setError(
          "Unable to load products. Make sure the ASP.NET Core API is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     CART QUANTITY
  ===================================================== */

  const getCartQuantity = (productId) => {
    return cartQuantities[productId] || 1;
  };

  const increaseQuantity = (product) => {
    const currentQuantity = getCartQuantity(product.id);

    if (currentQuantity >= product.quantity) {
      return;
    }

    setCartQuantities((previous) => ({
      ...previous,
      [product.id]: currentQuantity + 1,
    }));
  };

  const decreaseQuantity = (productId) => {
    const currentQuantity = getCartQuantity(productId);

    if (currentQuantity <= 1) {
      return;
    }

    setCartQuantities((previous) => ({
      ...previous,
      [productId]: currentQuantity - 1,
    }));
  };

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart = async (product) => {
    const quantity = getCartQuantity(product.id);

    if (quantity <= 0) {
      return;
    }

    if (quantity > product.quantity) {
      setError(
        `Only ${product.quantity} units of ${product.name} are available.`
      );
      return;
    }

    try {
      setError("");
      setAddingToCart(product.id);

      await api.post("/Sales/items", {
        productId: product.id,
        quantity: quantity,
      });

      setCartQuantities((previous) => ({
        ...previous,
        [product.id]: 1,
      }));
    } catch (error) {
      console.error("Error adding product to cart:", error);

      if (error.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (error.response?.status === 403) {
        setError(
          "You are not authorized to add products to the cart."
        );
      } else if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Unable to add product to cart."
        );
      } else {
        setError(
          "Unable to add product to cart. Make sure the ASP.NET Core API is running."
        );
      }
    } finally {
      setAddingToCart(null);
    }
  };

  /* =====================================================
     ADD PRODUCT
  ===================================================== */

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setNewProduct((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();

    setError("");

    if (!newProduct.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!newProduct.category.trim()) {
      setError("Category is required.");
      return;
    }

    const price = Number(newProduct.price);
    const quantity = Number(newProduct.quantity);

    if (Number.isNaN(price) || price <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    if (
      Number.isNaN(quantity) ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError("Quantity must be a whole number and cannot be negative.");
      return;
    }

    try {
      setAddingProduct(true);

      const response = await api.post("/Products", {
        name: newProduct.name.trim(),
        price: price,
        category: newProduct.category.trim(),
        quantity: quantity,
      });

      setProducts((previous) => [
        ...previous,
        response.data,
      ]);

      setNewProduct({
        name: "",
        price: "",
        category: "",
        quantity: "",
      });

      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding product:", error);

      if (error.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (error.response?.status === 403) {
        setError("You are not authorized to add products.");
      } else if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Unable to add product."
        );
      } else {
        setError(
          "Unable to add product. Make sure the ASP.NET Core API is running."
        );
      }
    } finally {
      setAddingProduct(false);
    }
  };

  const closeAddModal = () => {
    if (addingProduct) {
      return;
    }

    setShowAddModal(false);

    setNewProduct({
      name: "",
      price: "",
      category: "",
      quantity: "",
    });
  };

  /* =====================================================
     EDIT PRODUCT
  ===================================================== */

  const openEditModal = (product) => {
    setError("");

    setEditingProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      quantity: product.quantity,
    });

    setShowEditModal(true);
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;

    setEditingProduct((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    setError("");

    if (!editingProduct.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!editingProduct.category.trim()) {
      setError("Category is required.");
      return;
    }

    const price = Number(editingProduct.price);
    const quantity = Number(editingProduct.quantity);

    if (Number.isNaN(price) || price <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    if (
      Number.isNaN(quantity) ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError("Quantity must be a whole number and cannot be negative.");
      return;
    }

    try {
      setUpdatingProduct(true);

      const response = await api.put(
        `/Products/${editingProduct.id}`,
        {
          name: editingProduct.name.trim(),
          price: price,
          category: editingProduct.category.trim(),
          quantity: quantity,
        }
      );

      setProducts((previous) =>
        previous.map((product) =>
          product.id === editingProduct.id
            ? response.data
            : product
        )
      );

      setShowEditModal(false);

      setEditingProduct({
        id: null,
        name: "",
        price: "",
        category: "",
        quantity: "",
      });
    } catch (error) {
      console.error("Error updating product:", error);

      if (error.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (error.response?.status === 403) {
        setError(
          "You are not authorized to update products."
        );
      } else if (error.response?.status === 404) {
        setError("Product not found.");
      } else if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Unable to update product."
        );
      } else {
        setError(
          "Unable to update product. Make sure the ASP.NET Core API is running."
        );
      }
    } finally {
      setUpdatingProduct(false);
    }
  };

  const closeEditModal = () => {
    if (updatingProduct) {
      return;
    }

    setShowEditModal(false);

    setEditingProduct({
      id: null,
      name: "",
      price: "",
      category: "",
      quantity: "",
    });
  };

  /* =====================================================
     DELETE PRODUCT
  ===================================================== */

  const openDeleteModal = (product) => {
    setError("");

    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deletingProduct) {
      return;
    }

    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) {
      return;
    }

    try {
      setDeletingProduct(true);
      setError("");

      await api.delete(
        `/Products/${productToDelete.id}`
      );

      setProducts((previous) =>
        previous.filter(
          (product) =>
            product.id !== productToDelete.id
        )
      );

      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);

      if (error.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (error.response?.status === 403) {
        setError(
          "You are not authorized to delete products."
        );
      } else if (error.response?.status === 404) {
        setError("Product not found.");
      } else if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Unable to delete product."
        );
      } else {
        setError(
          "Unable to delete product. Make sure the ASP.NET Core API is running."
        );
      }
    } finally {
      setDeletingProduct(false);
    }
  };

  return (
    <div className="products-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="products-header">

        <div className="products-header-text">

          <span className="section-label">
            INVENTORY
          </span>

          <h2>
            Products
          </h2>

          <p>
            {isAdmin
              ? "Manage your store inventory and products."
              : "Browse products available in the store."}
          </p>

        </div>

        <div className="products-header-actions">

          <div className="products-summary">

            <div className="summary-number">
              {products.length}
            </div>

            <div className="summary-text">
              <span>Products</span>
              <small>In inventory</small>
            </div>

          </div>

          {isAdmin && (
            <button
              type="button"
              className="add-product-button"
              onClick={() => {
                setError("");
                setShowAddModal(true);
              }}
            >
              <span>＋</span>
              Add Product
            </button>
          )}

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="products-error">
          {error}
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className="products-message">

          <div className="loading-spinner"></div>

          <span>
            Loading products...
          </span>

        </div>
      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        !error &&
        products.length === 0 && (
          <div className="products-message">
            No products found.
          </div>
        )}

      {/* =================================================
          PRODUCTS
      ================================================= */}

      {!loading &&
        products.length > 0 && (

          <div className="products-grid">

            {products.map((product) => {

              const selectedQuantity =
                getCartQuantity(product.id);

              return (

                <div
                  className="product-card"
                  key={product.id}
                >

                  <div className="product-top">

                    <div className="product-icon">
                      {product.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <span className="product-category">
                      {product.category}
                    </span>

                  </div>

                  <div className="product-details">

                    <h3>
                      {product.name}
                    </h3>

                    <div className="product-price">
                      ${Number(product.price).toFixed(2)}
                    </div>

                    <div
                      className={
                        product.quantity > 0
                          ? "stock-status"
                          : "stock-status out-of-stock"
                      }
                    >

                      <span className="stock-dot"></span>

                      {product.quantity > 0
                        ? `${product.quantity} units available`
                        : "Out of stock"}

                    </div>

                  </div>

                  <div className="product-actions">

                    {/* =================================================
                        ADMIN ACTION LAYOUT
                        Row 1: Quantity + Edit
                        Row 2: Add to Cart + Delete
                    ================================================= */}

                    {isAdmin ? (

                      <div className="admin-product-cart-area">

                        <div className="product-action-row">

                          {product.quantity > 0 ? (

                            <div className="quantity-selector">

                              <button
                                type="button"
                                className="quantity-button"
                                onClick={() =>
                                  decreaseQuantity(product.id)
                                }
                                disabled={
                                  addingToCart === product.id ||
                                  selectedQuantity <= 1
                                }
                              >
                                −
                              </button>

                              <span className="quantity-value">
                                {selectedQuantity}
                              </span>

                              <button
                                type="button"
                                className="quantity-button"
                                onClick={() =>
                                  increaseQuantity(product)
                                }
                                disabled={
                                  addingToCart === product.id ||
                                  selectedQuantity >= product.quantity
                                }
                              >
                                +
                              </button>

                            </div>

                          ) : (

                            <div className="quantity-selector quantity-disabled">
                              <span className="quantity-value">
                                0
                              </span>
                            </div>

                          )}

                          <button
                            type="button"
                            className="product-edit-button"
                            onClick={() =>
                              openEditModal(product)
                            }
                          >
                            <span>✎</span>
                            Edit
                          </button>

                        </div>

                        <div className="product-action-row">

                          <button
                            type="button"
                            className="product-cart-button"
                            disabled={
                              product.quantity === 0 ||
                              addingToCart === product.id
                            }
                            onClick={() =>
                              handleAddToCart(product)
                            }
                          >

                            <span>🛒</span>

                            {addingToCart === product.id
                              ? "Adding..."
                              : product.quantity === 0
                              ? "Out of Stock"
                              : "Add to Cart"}

                          </button>

                          <button
                            type="button"
                            className="product-delete-button"
                            onClick={() =>
                              openDeleteModal(product)
                            }
                          >
                            <span>×</span>
                            Delete
                          </button>

                        </div>

                      </div>

                    ) : (

                      /* =================================================
                         USER ACTION LAYOUT
                      ================================================= */

                      <div className="user-product-cart-area">

                        {product.quantity > 0 && (

                          <div className="quantity-selector">

                            <button
                              type="button"
                              className="quantity-button"
                              onClick={() =>
                                decreaseQuantity(product.id)
                              }
                              disabled={
                                addingToCart === product.id ||
                                selectedQuantity <= 1
                              }
                            >
                              −
                            </button>

                            <span className="quantity-value">
                              {selectedQuantity}
                            </span>

                            <button
                              type="button"
                              className="quantity-button"
                              onClick={() =>
                                increaseQuantity(product)
                              }
                              disabled={
                                addingToCart === product.id ||
                                selectedQuantity >= product.quantity
                              }
                            >
                              +
                            </button>

                          </div>

                        )}

                        <button
                          type="button"
                          className="product-cart-button"
                          disabled={
                            product.quantity === 0 ||
                            addingToCart === product.id
                          }
                          onClick={() =>
                            handleAddToCart(product)
                          }
                        >

                          <span>🛒</span>

                          {addingToCart === product.id
                            ? "Adding..."
                            : product.quantity === 0
                            ? "Out of Stock"
                            : "Add to Cart"}

                        </button>

                      </div>

                    )}

                  </div>

                </div>

              );

            })}

          </div>

        )}

      {/* =================================================
          ADD PRODUCT MODAL
      ================================================= */}

      {showAddModal && isAdmin && (

        <div
          className="product-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddModal();
            }
          }}
        >

          <div className="product-modal">

            <div className="product-modal-header">

              <div>

                <span className="section-label">
                  INVENTORY
                </span>

                <h3>
                  Add New Product
                </h3>

                <p>
                  Add a new product to your inventory.
                </p>

              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeAddModal}
                disabled={addingProduct}
              >
                ×
              </button>

            </div>

            <form
              className="product-form"
              onSubmit={handleAddProduct}
            >

              <div className="form-group">

                <label htmlFor="product-name">
                  Product Name
                </label>

                <input
                  id="product-name"
                  name="name"
                  type="text"
                  placeholder="e.g. Chocolate"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  disabled={addingProduct}
                  required
                />

              </div>

              <div className="product-form-row">

                <div className="form-group">

                  <label htmlFor="product-price">
                    Price
                  </label>

                  <input
                    id="product-price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    disabled={addingProduct}
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="product-quantity">
                    Quantity
                  </label>

                  <input
                    id="product-quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={newProduct.quantity}
                    onChange={handleInputChange}
                    disabled={addingProduct}
                    required
                  />

                </div>

              </div>

              <div className="form-group">

                <label htmlFor="product-category">
                  Category
                </label>

                <input
                  id="product-category"
                  name="category"
                  type="text"
                  placeholder="e.g. Grocery"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  disabled={addingProduct}
                  required
                />

              </div>

              <div className="product-form-actions">

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={closeAddModal}
                  disabled={addingProduct}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-submit-button"
                  disabled={addingProduct}
                >
                  {addingProduct
                    ? "Adding..."
                    : "Add Product"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================================
          EDIT PRODUCT MODAL
      ================================================= */}

      {showEditModal && isAdmin && (

        <div
          className="product-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditModal();
            }
          }}
        >

          <div className="product-modal">

            <div className="product-modal-header">

              <div>

                <span className="section-label">
                  INVENTORY
                </span>

                <h3>
                  Edit Product
                </h3>

                <p>
                  Update the information for this product.
                </p>

              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeEditModal}
                disabled={updatingProduct}
              >
                ×
              </button>

            </div>

            <form
              className="product-form"
              onSubmit={handleUpdateProduct}
            >

              <div className="form-group">

                <label htmlFor="edit-product-name">
                  Product Name
                </label>

                <input
                  id="edit-product-name"
                  name="name"
                  type="text"
                  value={editingProduct.name}
                  onChange={handleEditInputChange}
                  disabled={updatingProduct}
                  required
                />

              </div>

              <div className="product-form-row">

                <div className="form-group">

                  <label htmlFor="edit-product-price">
                    Price
                  </label>

                  <input
                    id="edit-product-price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={handleEditInputChange}
                    disabled={updatingProduct}
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="edit-product-quantity">
                    Quantity
                  </label>

                  <input
                    id="edit-product-quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={editingProduct.quantity}
                    onChange={handleEditInputChange}
                    disabled={updatingProduct}
                    required
                  />

                </div>

              </div>

              <div className="form-group">

                <label htmlFor="edit-product-category">
                  Category
                </label>

                <input
                  id="edit-product-category"
                  name="category"
                  type="text"
                  value={editingProduct.category}
                  onChange={handleEditInputChange}
                  disabled={updatingProduct}
                  required
                />

              </div>

              <div className="product-form-actions">

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={closeEditModal}
                  disabled={updatingProduct}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-submit-button"
                  disabled={updatingProduct}
                >
                  {updatingProduct
                    ? "Updating..."
                    : "Update Product"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================================
          DELETE CONFIRMATION MODAL
      ================================================= */}

      {showDeleteModal &&
        isAdmin &&
        productToDelete && (

          <div
            className="product-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeDeleteModal();
              }
            }}
          >

            <div className="delete-modal">

              <div className="delete-icon">
                ×
              </div>

              <h3>
                Delete Product?
              </h3>

              <p>
                Are you sure you want to delete
                <strong>
                  {" "}
                  {productToDelete.name}
                </strong>
                ?
              </p>

              <span className="delete-warning">
                This action cannot be undone.
              </span>

              <div className="delete-modal-actions">

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={closeDeleteModal}
                  disabled={deletingProduct}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="confirm-delete-button"
                  onClick={handleDeleteProduct}
                  disabled={deletingProduct}
                >
                  {deletingProduct
                    ? "Deleting..."
                    : "Delete Product"}
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default Products;