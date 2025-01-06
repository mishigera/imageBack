import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/auth';
import imageRoutes from "./routes/imageRoutes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});



app.use("/api/images", imageRoutes);

// Servir imágenes desde la carpeta 'uploads'
app.use("/uploads", express.static("uploads"));

app.use(express.json());
app.use('/api/auth', authRoutes);
