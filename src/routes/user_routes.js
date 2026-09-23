const express = require('express'); 
const userController = require('../controllers/user.controller'); 
const validate = require('../middlewares/validate.middleware'); 
const { registerUserSchema, getUserByIdSchema } = require('../validators/user.validator'); 
const router = express.Router(); 
router.post('/register', validate(registerUserSchema), userController.register); 
router.get('/:id', validate(getUserByIdSchema), userController.getUser); 
module.exports = router;