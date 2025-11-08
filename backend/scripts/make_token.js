const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.AUTH_SECRET || 'change_this_in_production';
const userId = process.argv[2] || 'local_12345';
const email = process.argv[3] || 'test@example.com';

const token = jwt.sign({ id: userId, email }, secret, { expiresIn: '30d' });
console.log(token);
