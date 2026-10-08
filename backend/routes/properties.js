
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async(req,res)=>{
   
    try{
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
    
        //query params: city, zipcode, minPrice, maxPrice, beds, baths
        const {city,zipcode,minPrice,maxPrice,beds,baths}=req.query;

        const conditions = [];
        const params = [];

        if(city){
            conditions.push('L_City = ?');
            params.push(city);
        }
        if (zipcode) {
            conditions.push('L_Zip = ?');
            params.push(zipcode);
        }
        if(minPrice){
            conditions.push('L_SystemPrice >= ?');
            params.push(minPrice);
        }
        if (maxPrice) {
            conditions.push('L_SystemPrice <= ?');
            params.push(maxPrice);
        }
        if (beds) {
            conditions.push('L_Keyword2 >= ?');
            params.push(beds);
        }
        if(baths){
            conditions.push('LM_Dec_3 >= ?');
            params.push(baths);
        }
        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    
        const [[{total}]] = await pool.query(
        `SELECT COUNT(*) AS total FROM rets_property ${where}`, params
        )

        //id  | L_ListingID | L_DisplayId | L_Address  | L_Keyword2 | LM_Dec_3 | LM_Int2_3 | L_SystemPrice |
        const [rows] = await pool.query(
            `SELECT id, L_Address, L_City, L_Zip, L_SystemPrice, L_Keyword2, LM_Dec_3
            FROM rets_property
            ${where}
            ORDER BY id
            LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

            ///api/properties?city=Irvine&minPrice=300000&beds=3&limit=20&offset=0
            //ex. { "total": 87, "limit": 20, "offset": 0, "results": [...] }
            res.json({ total, limit, offset, "results": rows });
        }catch(err){
            console.error(err);
            res.status(500).json({err: "Server error"});
        }   
});

module.exports = router;