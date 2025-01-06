import db from '../db';
import jwt from 'jsonwebtoken';

export const middleware = async (req: any, res: any, next: any) => {
    try {
        
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: 'No autorizado' });
        }
        const [rows]: any = await db.query('SELECT COUNT(*) FROM auth_sessions WHERE token = ?', [token]);

        if (rows[0].count === 0) {
            return res.status(401).json({ message: 'Token no válido o no autorizado' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;

        next();
    } catch (ex) {
        res.status(401).json({ message: 'No autorizado' });
    }
}
