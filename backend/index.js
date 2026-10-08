
//connect health.js to index.js
const express = require('express');
const healthRoute = require('./routes/health');
const propertiesRoute = require('./routes/properties')

const app = express();

app.use('/api', healthRoute) //tells Express "stick /api in front of every route defined inside healthRoute."
app.listen(5000, () => console.log('Server running on port 5000'));

//properties route
app.use('/api/properties', propertiesRoute)