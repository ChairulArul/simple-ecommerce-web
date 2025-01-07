import React, { useState, useEffect } from "react";
import axios from "axios";

const UserHome = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const response = await axios.get("http://localhost:5000/api/products");
    setProducts(response.data);
  };

  return (
    <div>
      <h1>Product List</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <strong>${product.price}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserHome;
