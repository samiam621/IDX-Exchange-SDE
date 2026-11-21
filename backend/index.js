
//connect health.js to index.js
const express = require('express');
const healthRoute = require('./routes/health');
const propertiesRoute = require('./routes/properties')

const app = express();

// request log: "<time> GET /api/properties?city=Irvine 200 12.3ms"
// performance.now() gives sub-millisecond precision (Date.now() rounds to whole ms)
app.use((req, res, next) => {
    const startedAt = performance.now();
    const timestamp = new Date().toISOString();

    res.on('finish', () => {
        const duration = (performance.now() - startedAt).toFixed(1);
        console.log(`${timestamp} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });

    next();
});

app.use('/api', healthRoute) //tells Express "stick /api in front of every route defined inside healthRoute."
//properties route
app.use('/api/properties', propertiesRoute)

app.listen(5000, () => console.log('Server running on port 5000'));