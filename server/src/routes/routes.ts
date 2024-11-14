import { Router } from "express";
import { uploadVideoService, getUploadedVideosService } from "./services/uploadService";
import { uploadMiddleware } from "./middlewares/uploadMiddleware";

const routes = Router();

routes.post('/upload', uploadMiddleware.single('video'), uploadVideoService);
routes.get('/getUploads', getUploadedVideosService);

export default routes;