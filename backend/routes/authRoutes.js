import express from "express";
import { login, register, getProfile, getAllUsers, deleteUser, updateUserPremium } from "../controllers/authController.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/profile", authorize(), getProfile);
router.get("/all", authorize(["admin"]), getAllUsers);
router.delete("/:id", authorize(["admin"]), deleteUser);
router.put("/premium/:id", authorize(["admin"]), updateUserPremium);

export default router;
