const express = require("express");
const mongoose = require("mongoose");
const CardsRouter = require("./routes/cards");
const UsersRouter = require("./routes/users");

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect("mongodb://localhost:27017/mestodb");

app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

app.use((req, res, next) => {
  req.user = {
    _id: "5d8b8592978f8bd833ca8133",
  };

  next();
});

app.use(express.json());
app.use(CardsRouter);
app.use(UsersRouter);

app.use("/*", (req, res) => {
  res.status(404).send({ message: "Страница не найдена" });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
