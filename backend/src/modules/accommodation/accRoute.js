const express = require("express");
const accController = require("../accommodation/accController.js");
const router = express.Router();

// Block routes (must precede /:id)
router.post("/blocks", accController.addBlock);
router.get("/blocks", accController.getAllBlocks);
router.get("/blocks/:id", accController.getBlockById);
router.put("/blocks/:id", accController.editBlock);
router.delete("/blocks/:id", accController.removeBlock);

// Room allocation & deallocation
router.put("/:id/allocate", accController.allocateStudents);
router.delete("/:id/allocate/:userId", accController.deallocateStudent);
router.post("/:id/deallocate", accController.deallocateStudent);

// Room CRUD routes
router.post("/", accController.addAccommodation);
router.get("/", accController.getAllAccommodation);
router.get("/:id", accController.getAccommodationById);
router.put("/:id", accController.editAccommodation);
router.delete("/:id", accController.removeAccommodation);

module.exports = router;
