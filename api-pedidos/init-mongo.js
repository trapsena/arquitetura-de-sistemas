db = db.getSiblingDB("pedidos");

db.createUser({
  user: "user",
  pwd: "pass",
  roles: [{ role: "readWrite", db: "pedidos" }]
});

db.createCollection("pedidos");
