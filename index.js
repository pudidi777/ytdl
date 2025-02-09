import axios from 'axios';

async function handleRequest(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
        return new Response('URL parameter is required', { status: 400 });
    }

    const method = url.searchParams.get('method') || 'GET';
    const body = url.searchParams.get('body') ? JSON.parse(url.searchParams.get('body')) : undefined;

    const headersParam = url.searchParams.get('headers');
    let headers = {
        'Content-Type': 'application/json',
    };

    if (headersParam) {
        try {
            headers = { ...headers, ...JSON.parse(headersParam) };
        } catch (error) {
            return new Response('Invalid headers format', { status: 400 });
        }
    }

    const params = new URLSearchParams(url.searchParams);
    params.delete('url');

    const finalUrl = new URL(targetUrl);
    finalUrl.search = params.toString();

    const config = {
        method: method,
        url: finalUrl.toString(),
        headers: headers,
        data: body,
        responseType: 'arraybuffer', // Mengambil respons sebagai buffer untuk menangani semua tipe data
    };

    try {
        const response = await axios(config);

        // Ambil Content-Type dari respons axios
        const contentType = response.headers['content-type'] || 'application/octet-stream';

        // Kembalikan respons dalam format aslinya
        return new Response(response.data, {
            status: response.status,
            headers: {
                'Content-Type': contentType, // Gunakan Content-Type dari respons axios
            },
        });
    } catch (error) {
        return new Response('Error: ' + error.message, { status: 500 });
    }
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});