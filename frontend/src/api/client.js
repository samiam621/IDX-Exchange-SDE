// GET a URL and return JSON, or throw a readable error
async function getJson(url) {
    let res;
    try {
        res = await fetch(url);
    } catch {
        throw new Error('Cannot reach the server. Is the backend running?');
    }

    // fetch does NOT throw on 404/500, so check manually
    if (!res.ok) {
        const body = await res.json().catch(() => ({})); // body may not be JSON; ({}) returns an empty object
        // Vite's proxy returns a bare 500 when the backend is down
        throw new Error(body.error || (res.status >= 500 ? 'Server unavailable' : `Request failed (${res.status})`));
    }
    return res.json();
}

// Fetch a list of properties, e.g. fetchProperties({ city: 'Irvine', limit: 20 })
// Empty values ('', null, undefined) are dropped so the backend never sees ?city=&beds=
export function fetchProperties(params = {}) {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
    return getJson(`/api/properties?${new URLSearchParams(clean)}`);
}

// Fetch one property by id
export function fetchPropertyDetail(id) {
    return getJson(`/api/properties/${encodeURIComponent(id)}`);
}
