import express from "express";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config(); // 👈 carga las variables de entorno

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Verifica que se está leyendo la variable
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.get("/api/usuarios", async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS total FROM "Usuario"');
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error consultando usuarios:", err);
    res.status(500).json({ error: "Error consultando usuarios" });
  }
});

app.get("/api/usuarios-lista", async (req, res) => {
  try {
    const result = await pool.query('SELECT id_usuario, nombre, rol FROM "Usuario"');
    res.json(result.rows);
  } catch (err) {
    console.error("Error consultando lista de usuarios:", err);
    res.status(500).json({ error: "Error consultando usuarios" });
  }
});

app.listen(3001, () => {
  console.log("✅ Backend corriendo en http://localhost:3001");
});
