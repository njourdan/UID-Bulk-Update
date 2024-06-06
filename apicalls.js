import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.API_KEY

export async function razorCall(endPoint,options = {}){
    const url = `https://apiprod.razorerp.com/api/v1/${endPoint}`;
    const defaultHeaders = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
    };
    options.headers = { ...defaultHeaders, ...options.headers };
    options.method = options.method || "GET";

    const response = await fetch(url, options);
    return await response.json();
}