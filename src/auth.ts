export async function signRequest(
    method: string,
    path: string,
    body: string,
    secretKey: string
): Promise<{ signature: string; timestamp: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = `${method.toLocaleUpperCase()}\n${path}\n${timestamp}\n${body}`;

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