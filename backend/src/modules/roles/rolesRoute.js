const express = require("express");
const router = express.Router();
const rolesController = require("./rolesController");

router.get("/", rolesController.getAllRoles);
router.get("/:id", rolesController.getRoleById);

module.exports = router;
