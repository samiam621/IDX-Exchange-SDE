
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function parsePropertyId(value) {
    if (!/^\d+$/.test(value)) {
        return null;
    }

    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

router.get('/', async(req,res)=>{
   
    try{
        //query params: city, zipcode, minPrice, maxPrice, beds, baths
        const {city,zipcode,minPrice,maxPrice,beds,baths}=req.query;
         // validate limit (default 20)
        let limit = 20;
        if (req.query.limit !== undefined) {
            const n = Number(req.query.limit);
            if (!Number.isInteger(n) || n < 1 || n > 100) {
                return res.status(400).json({ error: 'limit must be a whole number from 1 to 100' });
            }
            limit = n;
        }

    
        let offset = 0;
        if (req.query.offset !== undefined) {
            const n = Number(req.query.offset);
            if (!Number.isInteger(n) || n < 0) {
                return res.status(400).json({ error: 'offset must be a whole number, 0 or more' });
            }
            offset = n;
        }
    
        // each filter, if sent, must be a number 0 or more
        for (const [name, value] of Object.entries({ minPrice, maxPrice, beds, baths })) {
            if (value !== undefined && (value === '' || isNaN(Number(value)) || Number(value) < 0)) {
                return res.status(400).json({ error: `${name} must be a number, 0 or more` });
            }
        }

        // min can't exceed max
        if (minPrice !== undefined && maxPrice !== undefined && Number(minPrice) > Number(maxPrice)) {
            return res.status(400).json({ error: 'minPrice cannot be greater than maxPrice' });
        }
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
        //pulling the rows
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
            res.status(500).json({error: "Server error"});
        }   
});

router.get('/:id/openhouses', async (req, res) => {
    const id = parsePropertyId(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: 'Property ID must be a positive whole number within the supported range' });
    }

    try {
        const [properties] = await pool.query(
            'SELECT L_ListingID FROM rets_property WHERE id = ? LIMIT 1',
            [id]
        );

        if (properties.length === 0) {
            return res.status(404).json({ error: `Property with ID ${id} was not found` });
        }

        const [openhouses] = await pool.query(
            `SELECT *
            FROM rets_openhouse
            WHERE L_ListingID = ?
            ORDER BY
                CASE WHEN JSON_VALID(all_data)
                    THEN JSON_UNQUOTE(JSON_EXTRACT(all_data, '$.OH_Date'))
                END,
                CASE WHEN JSON_VALID(all_data)
                    THEN JSON_UNQUOTE(JSON_EXTRACT(all_data, '$.OH_StartTime'))
                END`,
            [properties[0].L_ListingID]
        );

        res.json(openhouses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Unable to retrieve open houses for this property' });
    }
});

router.get('/:id', async (req, res) => {
    const id = parsePropertyId(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: 'Property ID must be a positive whole number within the supported range' });
    }

    try {
        const [properties] = await pool.query(
            'SELECT * FROM rets_property WHERE id = ? LIMIT 1',
            [id]
        );

        if (properties.length === 0) {
            return res.status(404).json({ error: `Property with ID ${id} was not found` });
        }

        res.json(properties[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Unable to retrieve this property' });
    }
});

module.exports = router;