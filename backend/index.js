
//connect health.js to index.js
const express = require('express');
const healthRoute = require('./routes/health');
const propertiesRoute = require('./routes/properties')

const app = express();

app.use((req, res, next) => {
    const startedAt = Date.now();
    const timestamp = new Date().toISOString();

    res.on('finish', () => {
        const duration = Date.now() - startedAt;
        console.log(`${timestamp} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });

    next();
});

app.use('/api', healthRoute) //tells Express "stick /api in front of every route defined inside healthRoute."
//properties route
app.use('/api/properties', propertiesRoute)

app.listen(5000, () => console.log('Server running on port 5000'));