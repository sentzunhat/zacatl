db = db.getSiblingDB("appdb");

db.createUser({
  user: "local",
  pwd: "local",
  roles: [
    {
      role: "readWrite",
      db: "appdb",
    },
  ],
});
