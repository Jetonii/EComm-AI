require("dotenv").config();

const express = require("express");
const cors = require("cors");
const user = require("./routes/user");

const app = express();

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next();
})

app.use("/user", user);

const server = app.listen(process.env.PORT, () => {
    console.log(`Server listening at port ${process.env.PORT} `)
})