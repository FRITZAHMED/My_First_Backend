import {Request,Response,NextFunction} from 'express';

const errorHandler = ( req:Request, res:Response, next:NextFunction) => { 
const statusCode = err.statusCode || 500; 
const message = err.message || 'Erreur interne du serveur'; 
res.status(statusCode).json({ 
success: false, 
message, 
stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
}); 
}; 
module.exports = errorHandler;