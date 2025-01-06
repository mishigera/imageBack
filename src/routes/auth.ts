import express from 'express';
import bcrypt from 'bcrypt';
import {
    body,
    validationResult
} from 'express-validator';
import db from '../db';

const router = express.Router();

router.post(
    '/register',
    [
        body('username').isLength({
            min: 3
        }).withMessage('El usuario debe tener al menos 3 caracteres'),
        body('password').isLength({
            min: 6
        }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    ],
    async (req: any, res: any) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            username,
            password
        } = req.body;

        try {
            // Verificar si el usuario ya existe
            const [userExists]: any = await db.query('SELECT * FROM users WHERE username = ?', [username]);
            if (userExists.length > 0) {
                return res.status(400).json({
                    message: 'El usuario ya existe'
                });
            }

            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar el usuario en la base de datos
            await db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword]);

            res.status(201).json({
                message: 'Usuario registrado correctamente'
            });
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: 'Error al registrar el usuario'
            });
        }
    }
);

export default router;
import jwt from 'jsonwebtoken';

router.post('/login', async (req: any, res: any) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(req.body)
    try {
        // Verificar si el usuario existe
        const [userExists]: any = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (userExists.length === 0) {
            return res.status(400).json({
                message: 'Usuario o contraseña incorrectos'
            });
        }

        const user = userExists[0];

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Usuario o contraseña incorrectos'
            });
        }

        // Generar el token
        const token = jwt.sign({
            id: user.id,
            username: user.username
        }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1h',
        });
        const createdAt = new Date(  new Date().getTime() - 6 * 60 * 60 *1000 ).toISOString().slice(0, 19).replace('T', ' '); 
        const createdDate = new Date(createdAt.replace(' ', 'T'));
        const expiresAt = new Date(createdDate.getTime() + 60 * 60 * 1000) 

        await db.query('INSERT INTO auth_sessions (user_id, token, created_at, expires_at) VALUES (?,?,?,?)', [user.id, token, createdAt, expiresAt]);
        res.json({
            token,
            user_id: user.id
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error al iniciar sesión'
        });
    }
});