const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const scanRouter = require('./routes/scanRouter');

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), () => {
  console.log("Server listening on port", app.get("port"));
});

app.use('/scan', scanRouter)


