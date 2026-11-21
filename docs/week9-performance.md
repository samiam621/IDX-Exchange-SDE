# Week 9 — Performance

## 52. EXPLAIN on the most complex filter query

The heaviest listings request filters on four columns and sorts:

```
GET /api/properties?city=Irvine&minPrice=500000&maxPrice=1500000&beds=3&sortBy=L_SystemPrice&sortOrder=asc
```

which runs (plus a matching `COUNT(*)`):

```sql
SELECT id, L_Address, L_City, L_State, L_Zip, L_SystemPrice, L_Keyword2, LM_Dec_3, LM_Int2_3, L_Photos
FROM rets_property
WHERE L_City = 'Irvine' AND L_SystemPrice >= 500000 AND L_SystemPrice <= 1500000 AND L_Keyword2 >= 3
ORDER BY L_SystemPrice ASC, id
LIMIT 20 OFFSET 0;
```

Reproduce: `cd backend && node scripts/explain.js`

### What each EXPLAIN column means

| Column | Meaning |
|---|---|
| `id` | Which SELECT in the statement this row describes (1 for a simple query; subqueries/unions get more). |
| `select_type` | Kind of SELECT: `SIMPLE` (no subqueries/unions), `PRIMARY`, `SUBQUERY`, `DERIVED`, `UNION`. |
| `table` | Table this row reads. |
| `partitions` | Partitions scanned (`NULL` = table isn't partitioned). |
| `type` | **Access method, best → worst:** `const`/`eq_ref` (one row by key), `ref` (index lookup on equality), `range` (index range scan, e.g. `BETWEEN`/`>=`), `index` (full index scan), `ALL` (full table scan — the one to kill). |
| `possible_keys` | Indexes MySQL *could* use for this WHERE. `NULL` = no usable index exists. |
| `key` | Index MySQL actually *chose*. `NULL` = no index used. |
| `key_len` | Bytes of the chosen index used — shows how many columns of a composite index are used. |
| `ref` | What's compared to the index (`const` = a literal from the WHERE). |
| `rows` | MySQL's **estimate** of rows it must examine. Lower is better. |
| `filtered` | Estimated % of those rows left after the rest of the WHERE. `rows × filtered%` ≈ rows passed on. |
| `Extra` | Notes. `Using where` = filtering after reading rows; `Using index` = answered from the index alone; `Using index condition` = filter pushed into the index; **`Using filesort`** = an extra sort step for ORDER BY (costly on many rows). |

### Before indexes

_Paste output of `node scripts/explain.js` here._

**Reading it:** _(fill in from the output — e.g. `type = ALL`, `key = NULL` → full table scan of every row; `Using filesort` → every matching row is sorted before `LIMIT 20` keeps 20.)_

## 53. Composite indexes

Most common filter combos in the UI are **city + price** and **zip + price**, and the new sort options sort by price or date with no filters. Rule for composite indexes: equality column first (`L_City = ?`), then the range/sort column (`L_SystemPrice`), so one index serves both the WHERE and the ORDER BY (no filesort).

```sql
CREATE INDEX idx_city_price   ON rets_property (L_City, L_SystemPrice);
CREATE INDEX idx_zip_price    ON rets_property (L_Zip, L_SystemPrice);
CREATE INDEX idx_price        ON rets_property (L_SystemPrice);
CREATE INDEX idx_listing_date ON rets_property (L_ListingDate);
```

Applied with `node scripts/explain.js --create-indexes` (skips any that already exist).

`L_Keyword2 >= ?` (beds) is a second range condition, so it can't extend the index usefully after `L_SystemPrice`; MySQL filters it on the rows the index already narrowed.

### After indexes

_Paste output here._

| Query | Before (ms) | After (ms) | `type` before → after | `rows` before → after |
|---|---|---|---|---|
| page | | | | |
| count | | | | |

## 54. Request timing

`backend/index.js` logs every request when the response finishes, using `performance.now()`:

```
2026-11-20T21:03:11.512Z GET /api/properties?city=Irvine&sortBy=L_SystemPrice&sortOrder=asc&limit=20&offset=0 200 14.2ms
```
