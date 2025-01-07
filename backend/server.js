const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Koneksi ke database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "ecommerce",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to the database.");
});

// Endpoint untuk mendapatkan semua produk
app.get("/api/products", (req, res) => {
  const query = "SELECT * FROM products";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Endpoint untuk menambahkan produk (Admin)
app.post("/api/products", (req, res) => {
  const { name, price, description } = req.body;
  const query =
    "INSERT INTO products (name, price, description) VALUES (?, ?, ?)";
  db.query(query, [name, price, description], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res
      .status(201)
      .json({ message: "Product added successfully", id: result.insertId });
  });
});

// Endpoint untuk menghapus produk (Admin)
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM products WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Product deleted successfully" });
  });
});

// Data admin dummy
const adminUser = {
  username: "admin",
  password: bcrypt.hashSync("password", 10),
};

// Middleware untuk validasi token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided." });

  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err)
      return res.status(500).json({ message: "Failed to authenticate token." });
    req.userId = decoded.id;
    next();
  });
};

// Endpoint untuk login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === adminUser.username &&
    bcrypt.compareSync(password, adminUser.password)
  ) {
    const token = jwt.sign({ id: adminUser.username }, "secretKey", {
      expiresIn: "1h",
    });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid username or password." });
  }
});

// Endpoint produk untuk admin, dilindungi token
app.post("/api/products", verifyToken, (req, res) => {
  const { name, price, description } = req.body;
  const query =
    "INSERT INTO products (name, price, description) VALUES (?, ?, ?)";
  db.query(query, [name, price, description], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res
      .status(201)
      .json({ message: "Product added successfully", id: result.insertId });
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
