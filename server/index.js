const {
  client,
  createTables,
  createUser,
  createProduct,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
} = require("./db");

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
};

init();
