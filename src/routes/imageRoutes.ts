import express from "express";
import multer from "multer";
import path from "path";
import db from "../db";
import { middleware } from "../middlewares/tokenauth";


const {
  Jimp
} = require("jimp");
const router = express.Router();

// Configuración de Multer para guardar imágenes en 'uploads/'
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb) => {
    cb(null, "uploads/");
  },
  filename: (req: any, file: any, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage
});

// Endpoint para subir y procesar una imagen
router.post("/upload", middleware, upload.single("image"), async (req:any, res:any) => {
  try {
    // Verificar si se envió un archivo
    if (!req.file) {
      return res.status(400).json({ message: "No se ha subido ninguna imagen." });

    }
    const user_id = req.user?.id;
    if(!user_id){
      throw new Error("No se ha proporcionado un ID de usuario.");
    }
    const filePath = req.file.path; // Ruta de la imagen subida
    const processedPath = `uploads/processed-${req.file.filename}`; // Nueva imagen procesada

    // Leer la imagen con Jimp
    const image = await Jimp.read(filePath);

    // Obtener el ancho y la altura de los parámetros de la solicitud o usar valores predeterminados
    const width = parseInt(req.body.w) || 500;
    const height = parseInt(req.body.h) || Jimp.AUTO;

    // Redimensionar la imagen
    image.resize({w:width, h:height}); // Usar AUTO si solo se proporciona uno de los dos valores
    await image.write(processedPath);
    // Guardar la URL en la base de datos
    const url = `http://localhost:5001/${processedPath}`;
    await db.query("INSERT INTO images (url, user_id) VALUES (?, ?)", [url, user_id]);

    res.status(200).json({
      message: "Imagen procesada y guardada.",
      url
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "El tipo de archivo no es valido"
    });
  }
});

// Endpoint para obtener las imágenes
router.get("/images",middleware, async (req:any, res:any) => {
  const user_id = req.user?.id;

  if(!user_id){
    res.status(400).json({message: "No se ha proporcionado un ID de usuario."});
    return;}
  try {
    const [rows] = await db.query("SELECT * FROM images WHERE user_id = ?", [user_id]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las imágenes."
    });
  }
});




export default router;