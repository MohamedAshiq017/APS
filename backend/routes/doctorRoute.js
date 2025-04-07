import express from 'express';

import {doctorList, } from '../controllers/doctorController.js';

const doctorRouter = express.Router();

doctorRouter.get('/list',doctorList);
// doctorRouter.post("/login",loginDoctor)
export default doctorRouter;
