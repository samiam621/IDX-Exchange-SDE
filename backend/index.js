
//connect health.js to index.js
const express = require('express');
const healthRoute = require('./routes/health');

const app = express();

app.use('/api', healthRoute) //tells Express "stick /api in front of every route defined inside healthRoute."
app.listen(3000, () => console.log('Server running on port 3000'));

