const validate = (schema) => async (req, res, next) => { 
try { 
const parsed = await schema.parseAsync({ 
body: req.body, 
query: req.query, 
params: req.params 
}); 
// On réinjecte les données nettoyées/transformées dans la requête 
if (parsed.body) req.body = parsed.body; 
if (parsed.params) req.params = parsed.params; 
if (parsed.query) req.query = parsed.query; 
return next(); 
} catch (error) { 
if (error.name === 'ZodError') { 
return res.status(400).json({ 
success: false, 
message: 'Erreur de validation des données', 
errors: error.errors.map(err => ({ 
field: err.path.join('.'), 
message: err.message 
})) 
}); 
} 
return next(error); 
} 
}; 
module.exports = validate;