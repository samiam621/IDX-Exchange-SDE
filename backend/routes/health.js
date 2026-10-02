
const express = require('express'); //carries app
const router = express.Router(); //Express is a lightweight framework for building web servers/APIs in Node.js.
const pool = require('../config/db')


router.get('/health', async(req,res)=>{
    try{
        await pool.query("SELECT 1"); //test if we can reach db
        res.json({status: 'ok', db: 'connected'})
    } catch(err){
        res.status(500).json({status: 'error', db: 'disconnected'});
    }

});

module.exports = router;