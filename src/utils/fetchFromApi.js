const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// fetchFromApi supports two signatures for convenience:
// 1) fetchFromApi(endpoint, methodString = 'GET', payload)
// 2) fetchFromApi(endpoint, optionsObject)
// This change also guards against calling toUpperCase on non-string values.
const fetchFromApi = async (endpoint, arg2 = "GET", arg3) => {
    const url = `${baseUrl}${endpoint}`;

    let options;

    // If the second arg is a string, treat it as method name and arg3 as payload
    if (typeof arg2 === "string") {
        const method = arg2 ? String(arg2).toUpperCase() : "GET";
        if (method !== "GET") {
            options = {
                method,
                headers: { "Content-Type": "application/json" },
                body:
                    arg3 !== undefined
                        ? typeof arg3 === "string"
                            ? arg3
                            : JSON.stringify(arg3)
                        : undefined,
            };
        }
    } else if (arg2 && typeof arg2 === "object") {
        // If the second arg is an options object, clone it and normalize method/body
        options = { ...arg2 };
        if (options.method)
            options.method = String(options.method).toUpperCase();

        // If body is a plain object, stringify it and ensure content-type header
        if (options.body !== undefined && typeof options.body !== "string") {
            options.body = JSON.stringify(options.body);
            options.headers = {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            };
        }

        // Remove body for GET requests
        if (options.method === "GET") delete options.body;
    }

    const res = await fetch(url, options);

    if (!res.ok) {
        throw new Error(`API call to ${url} failed with status ${res.status}`);
    }

    return res;
};

export default fetchFromApi;
