const {
  client,
  createTables,
  createUser,
  createProduct,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  deleteFavorites,
} = require("./db");
const express = require("express");
const app = express();

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
  try {
    await deleteFavorites({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [Porter, Dionna, Gavin, grapes, bread, cheese, ramen] =
    await Promise.all([
      createUser({ username: "Porter", password: "s3cr3t" }),
      createUser({ username: "Dionna", password: "s3cr3t!!!" }),
      createUser({ username: "Gavin", password: "not s3cr3t" }),
      createProduct({ name: "grapes" }),
      createProduct({ name: "bread" }),
      createProduct({ name: "cheese" }),
      createProduct({ name: "ramen" }),
    ]);
  const users = await fetchUsers();
  console.log(users);

  const products = await fetchProducts();
  console.log(products);

  const favorites = await Promise.all([
    createFavorite({ user_id: Porter.id, product_id: bread.id }),
    createFavorite({ user_id: Porter.id, product_id: ramen.id }),
    createFavorite({ user_id: Dionna.id, product_id: bread.id }),
    createFavorite({ user_id: Gavin.id, product_id: cheese.id }),
  ]);
  console.log(await fetchFavorites(Porter.id));
  await deleteFavorites(favorites[1].id);
  console.log(await fetchFavorites(Porter.id));

  console.log(`CURL localhost:3000/api/users/${Porter.id}/favorites`);

  console.log(
    `CURL -X POST localhost:3000/api/users/${Porter.id}/favorites -d '{"products_id":"${grapes.id}"}' -H 'Content-Type:application/json'`
  );
};

const port = process.env.PORT || 3000;
app.listen(port, console.log(`listening on port ${port}`));

init();
