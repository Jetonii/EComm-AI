const express = require("express");
const { getAllUsers, addUser } = require("../controllers/userController");
const router = express.Router();

router.get("/allUsers", getAllUsers);
router.post("/addUser", addUser);

module.exports = router;