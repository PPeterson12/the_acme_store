const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_store_db"
);
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const createTables = async () => {
  const SQL = `
      DROP TABLE IF EXISTS favorites;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS products;
      CREATE TABLE users(
        id UUID PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) UNIQUE NOT NULL 
      );
      CREATE TABLE products(
        id UUID PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
      CREATE TABLE favorites(
        id UUID PRIMARY KEY,
        products_id UUID REFERENCES products(id) NOT NULL,
        users_id UUID REFERENCES users(id) NOT NULL,  
        CONSTRAINT unique_user_product UNIQUE (products_id, users_id)
      );
    `;
  await client.query(SQL);
};

const createUser = async ({ username, password }) => {
  let SQL = `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    username,
    await bcrypt.hash(password, 5),
  ]);
  return response.rows[0];
};

const createProduct = async ({ name }) => {
  const SQL = `
    INSERT INTO products(id, name) VALUES($1, $2) RETURNING *`;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createFavorite = async ({ user_id, product_id }) => {
  const SQL = `
        INSERT INTO favorites(id, users_id, products_id) VALUES($1, $2, $3) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);
  return response.rows[0];
};

const fetchUsers = async () => {
  const SQL = `
      SELECT * FROM users;
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchProducts = async () => {
  const SQL = `
      SELECT * FROM products;
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchFavorites = async (id) => {
  const SQL = `
      SELECT * FROM favorites
      WHERE users_id = $1
    `;
  const response = await client.query(SQL, [id]);
  return response.rows;
};

const deleteFavorites = async ({ id, users_id }) => {
  const SQL = `
    DELETE FROM favorites
    WHERE id = $1 AND users_id = $2
  `;
  await client.query(SQL, [id, users_id]);
};
module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  deleteFavorites,
};
