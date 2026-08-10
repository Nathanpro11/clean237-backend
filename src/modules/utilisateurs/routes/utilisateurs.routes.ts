import express from 'express';
import { createUser, createAgent, getAllUser, getUserById, updateUser, deleteUser } from '../controllers/utilisateurs.controller';

const userRoutes = express.Router();

userRoutes.post("/create", createUser);
userRoutes.post("/create_agent", createAgent);
userRoutes.get("/get_All", getAllUser);
userRoutes.get("/get_by_id/:idUser", getUserById);
userRoutes.put("/update_by_id/:idUser", updateUser);
userRoutes.delete("/delete_by_id/:idUser", deleteUser);

export default userRoutes;
