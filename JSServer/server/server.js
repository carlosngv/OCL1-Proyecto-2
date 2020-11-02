const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const parserRouter = require('./routes/parserRoute');

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

app.set("port", process.env.PORT || 3200);
app.listen(app.get("port"), () => {
  console.log("Server listening on port", app.get("port"));
});

/* fs.readFile('input.java', (err, data) => {
    if (err) throw err;
    parser.parse(data.toString());
    console.log(parser.parse(data.toString()).traduction)
}); */

app.use('/parse', parserRouter)
