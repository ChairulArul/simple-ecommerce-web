import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
  });
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login"); // Redirect ke halaman login jika belum ada token
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: token },
      });
      setProducts(response.data);
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post("http://localhost:5000/api/products", newProduct, {
        headers: { Authorization: token },
      });
      fetchProducts();
      setNewProduct({ name: "", price: "", description: "" });
    } catch (error) {
      console.error("Failed to add product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

  const deleteProduct = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: token },
      });
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
        />
        <textarea
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
        />
        <button onClick={addProduct}>Add Product</button>
      </div>

      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
            <button onClick={() => deleteProduct(product.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
