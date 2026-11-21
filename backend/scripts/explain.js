// Week 9 perf check: EXPLAIN the heaviest listings query and time it.
//   node scripts/explain.js                   -> EXPLAIN + timings with current indexes
//   node scripts/explain.js --create-indexes  -> add the composite indexes, then measure again
const pool = require('../config/db');

// Same shape the API builds for /api/properties?city=Irvine&minPrice=500000&maxPrice=1500000&beds=3&sortBy=L_SystemPrice
const WHERE = 'WHERE L_City = ? AND L_SystemPrice >= ? AND L_SystemPrice <= ? AND L_Keyword2 >= ?';
const PARAMS = ['Irvine', 500000, 1500000, 3];
const QUERIES = {
    count: `SELECT COUNT(*) AS total FROM rets_property ${WHERE}`,
    page: `SELECT id, L_Address, L_City, L_State, L_Zip, L_SystemPrice, L_Keyword2, LM_Dec_3, LM_Int2_3, L_Photos
           FROM rets_property ${WHERE} ORDER BY L_SystemPrice ASC, id LIMIT 20 OFFSET 0`,
};

// name -> columns. Equality column first, then the range/sort column.
const INDEXES = {
    idx_city_price: ['L_City', 'L_SystemPrice'],
    idx_zip_price: ['L_Zip', 'L_SystemPrice'],
    idx_price: ['L_SystemPrice'],        // unfiltered "sort by price"
    idx_listing_date: ['L_ListingDate'], // unfiltered "sort by date listed"
};

// run a query several times and return the middle time in ms (less noisy than one run)
async function median(sql, runs = 15) {
    const times = [];
    for (let i = 0; i < runs; i++) {
        const t = performance.now();
        await pool.query(sql, PARAMS);
        times.push(performance.now() - t);
    }
    times.sort((a, b) => a - b);
    return times[Math.floor(runs / 2)].toFixed(2);
}

// create each index in INDEXES unless it already exists
async function createIndexes() {
    const [existing] = await pool.query('SHOW INDEX FROM rets_property');
    const have = new Set(existing.map((r) => r.Key_name));
    for (const [name, cols] of Object.entries(INDEXES)) {
        if (have.has(name)) continue;
        console.log(`creating ${name} (${cols.join(', ')}) ...`);
        await pool.query(`CREATE INDEX ${name} ON rets_property (${cols.join(', ')})`);
    }
}

// main: (optionally) add indexes, then print EXPLAIN + timing for each query
(async () => {
    if (process.argv.includes('--create-indexes')) await createIndexes();

    // MySQL version and table size, for context
    const [[{ v }]] = await pool.query('SELECT VERSION() AS v');
    const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM rets_property');
    console.log(`MySQL ${v}, rets_property rows: ${n}\n`);

    for (const [name, sql] of Object.entries(QUERIES)) {
        // EXPLAIN shows HOW MySQL will run the query (indexes used, rows scanned, sorting)
        const [plan] = await pool.query(`EXPLAIN ${sql}`, PARAMS);
        console.log(`--- ${name} query ---`);
        console.table(plan);
        console.log(`median time: ${await median(sql)} ms\n`);
    }

    // list the indexes that exist now
    const [idx] = await pool.query('SHOW INDEX FROM rets_property');
    console.log('indexes:', [...new Set(idx.map((r) => r.Key_name))].join(', '));
    await pool.end();
})().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
