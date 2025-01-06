
import jwt from 'jsonwebtoken';

export const middleware = async (req: any, res: any, next: any) => {
    try {
        
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        console.log(decoded);

        next();
    } catch (ex) {
        res.status(401).json({ message: 'No autorizado' });
    }
}
