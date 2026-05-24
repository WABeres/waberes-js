export async function signRequest(
    method: string,
    path: string,
    body: string,
    secretKey: string
): Promise<{ signature: string; timestamp: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // hash the body using SHA-256
    const bodyBytes = new TextEncoder().encode(body);
    const bodyBuffer = await crypto.subtle.digest("SHA-256", bodyBytes);
    const bodyHash = Array.from(new Uint8Array(bodyBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    const payload = `${method.toLocaleUpperCase()}${path}${timestamp}${bodyHash}`;

    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const raw = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload));
    const signature = Array.from(new Uint8Array(raw))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return { signature, timestamp };
}