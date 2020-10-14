const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
var Scanner = require("./scanner/scanner");
const fs = require("fs");

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), () => {
  console.log("Server listening on port", app.get("port"));
});

const newScanner = new Scanner();

fs.readFile("./example.java", (err, data) => {
  if (err) throw err;
  data = data.toString();
  newScanner.scan(data);
  console.log(newScanner.tokenList);
  fs.writeFile("./TokensList.html", generateHTML(), (error) => {
    console.log(error);
  });
});



function generateHTML() {
  var cont = 1;
  let html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/flatly/bootstrap.min.css" integrity="sha384-qF/QmIAj5ZaYFAeQcrQ6bfVMAh4zZlrGwTPY7T/M+iTTLJqJBJjwwnsE5Y0mV7QK" crossorigin="anonymous">
      <link rel="stylesheet" href="styles/main.css">
      <title>Tabla de Tokens</title>
  </head>
  <body>
      <div class="container">
      <h1>Tabla de Tokens</h1>
      <table class="table table-striped">
        <thead class="thead-dark">
          <tr>
            <th scope="col">Num.</th>
            <th scope="col">Token</th>
            <th scope="col">Lexema</th>
            <th scope="col">Fila</th>
            <th scope="col">Columna</th>
          </tr>
        </thead>
        <tbody>

            `;

  newScanner.tokenList.forEach((item) => {
    html += "<tr>";
    html += `<td>${cont}</td>`
    html += `<td>${item.type}</td>`;
    html += `<td>${item.value}</td>`;
    html += `<td>${item.row}</td>`;
    html += `<td>${item.column}</td>`;
    html += "</tr>";
    cont++;
  });

  html += `
        </tbody>
                  </table>
                  </div>
            </body>
            </html>
            `;

  return html;
}
