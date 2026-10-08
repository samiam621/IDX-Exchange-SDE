
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async(req,res)=>{
   
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const [[{total}]] = await pool.query(
       'SELECT COUNT (*) AS total FROM rets_property'
    )

    //id  | L_ListingID | L_DisplayId | L_Address  | L_Keyword2 | LM_Dec_3 | LM_Int2_3 | L_SystemPrice |
    const results = await pool.query(
        'SELECT id, L_Address, L_City, L_Zip, L_SystemPrice, L_Keyword2, LM_Dec_3 \
        FROM rets_property\
        LIMIT ? OFFSET ?',
        [limit,offset]
    );
    const rows = results[0];

     //query params: city, zipcode, minPrice, maxPrice, beds, baths
    const {city,zipcode,minPrice,maxPrice,beds,baths}=req.query;
    
    try{
        ///api/properties?city=Irvine&minPrice=300000&beds=3&limit=20&offset=0
        //ex. { "total": 87, "limit": 20, "offset": 0, "results": [...] }
        res.json({ total, limit, offset, "results": rows });
    }catch(err){
        res.status(400).json({err});
    }
});

module.exports = router;