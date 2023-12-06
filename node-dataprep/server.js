const cors = require("cors");
const express = require("express");
const app = express();

// let corsOptions = {
//   origin: "http://localhost:8081",
// };
// app.use(cors());
// app.use(cors(corsOptions));
// 
// Enable CORS only for a specific origin
app.use(cors({
  origin: 'http://localhost:5000', // Adjust the port as needed
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// app.use(cors({ origin: '*' }));

const initRoutes = require("./src/routes");

app.use(express.urlencoded({ extended: true }));
initRoutes(app);

const port = 5000;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});