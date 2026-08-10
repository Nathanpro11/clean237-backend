import { Router } from "express";
import { createUser, createAgent, getAllUser, getUserById, updateUser, deleteUser } from "../controllers/utilisateurs.controller";

const router = Router();


router.post("/register", createUser);
router.post("/register/agent", createAgent);
router.get("/", getAllUser);
router.get("/:idUser", getUserById);
router.patch("/:idUser", updateUser);
router.delete("/:idUser", deleteUser);

export default router;
