
export async function razorCall(endPoint, apiKey, options = {}) {
    const url = `https://apiprod.razorerp.com/api/v1/${endPoint}`;
    const defaultHeaders = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        "cors": 'isolated-app'
    };
    options.headers = { ...defaultHeaders, ...options.headers };
    options.method = options.method || 'GET';
    const response = await fetch(url, options);
    return await response;
}
