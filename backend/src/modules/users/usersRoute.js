const express = require("express");
const router = express.Router();
const userController = require("./usersController");

router.post("/create", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/", userController.getAllUsers);
router.get("/count", userController.getUserCount);
router.get("/email/:email", userController.getUserByEmail);
router.get("/check-email/:email", userController.checkEmailExists);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);

// Password Reset via OTP & SMTP
router.post("/forgot-password/send-otp", userController.sendPasswordResetOtp);
router.post("/forgot-password/verify-otp", userController.verifyPasswordResetOtp);
router.post("/forgot-password/reset-password", userController.resetPasswordWithOtp);

module.exports = router;