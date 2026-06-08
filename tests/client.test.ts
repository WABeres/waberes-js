import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { server } from "./mocks/server";
import { SDKConfig } from "../src/types";
import { BASE_URL, DUMMY_API_KEY } from "./mocks/handlers";
import { WABeresClient } from "../src/client";
import { http, HttpResponse } from "msw";
import { APIError, AuthError, BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError, NotImplementedError, RateLimitError, UnacceptableError } from "../src/errors";
import { AccountPlanChoicesSchema, AccountRenewSchema, AccountSchema } from "../src/resources/account";
import { SendChatPresenceRequest, SendChatPresenceResponseSchema, SendMessagePayload, SendMessageResponseSchema } from "../src/resources/messages";
import { DeviceConnectQRSchema, DeviceDisconnectSchema, DeviceSchema } from "../src/resources/devices";


beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const config: SDKConfig = {
    apiKey: DUMMY_API_KEY,
    secretKey: "xxx",
    baseUrl: BASE_URL
}

// Constructor test
describe('WABeres client constructor', () => {
    it('throw if api key empty', () => {
        expect(() => new WABeresClient({...config, apiKey: ''})).toThrow('apiKey and secretKey are required');
    })

    it('throw if secret key is empty', () => {
        expect(() => new WABeresClient({...config, secretKey: ''})).toThrow('apiKey and secretKey are required');
    })

    it('successfully create instance of WABeresClient', () => {
        expect(new WABeresClient(config)).toBeInstanceOf(WABeresClient);
    })
})

// headers handling test
describe('headers handling', () => {
    it('should attach X-API-Key, X-Signature and X-Timestamp at header on every requests', async () => {
        let captured: Headers | null = null;

        server.use(
            http.get(`${BASE_URL}/api/v1/account/info`, ({ request }) => {
                captured = request.headers;
                return HttpResponse.json([]);
            })
        );

        const client = new WABeresClient(config);
        await client.account.getInfo();

        expect(captured!.get('X-API-Key')).toBe(DUMMY_API_KEY);
        expect(captured!.get('X-Signature')).toMatch(/^[a-f0-9]{64}$/);
        expect(captured!.get('X-Timestamp')).toBeTruthy();
    });
});

// middleware handling test
describe('middleware handling', () => {
    it('should returns Forbidden because X-API-Key is invalid or does not match with DB during request', async () => {
        const client = new WABeresClient({...config, apiKey: 'invalid'});

        await expect(client.account.getInfo()).rejects.toThrow(ForbiddenError);
    })

    it('should return AuthError because the X-API-Key, X-Signature or X-Timestamp is missing (UNAUTHORIZED)', async () => {
        server.use(
            http.get(`${BASE_URL}/api/v1/account/info`, () => {
                return HttpResponse.json({
                    "error": "missing X-API-Key header"
                }, { status: 401 })
            })
        )

        const client = new WABeresClient(config);
        await expect(client.account.getInfo()).rejects.toThrow(AuthError);
    })
});


// unknow error handling test
describe('unknown API error handling test', () => {
    it('should return APIError because the error returned from the server is unknown to the SDK', async () => {
        server.use(
            http.get(`${BASE_URL}/api/v1/account/info`, () => {
                return HttpResponse.json({
                    "error": "unknown"
                }, { status: 502 }) // 502 is not on the list of SDK's throwable errors
            })
        )

        const client = new WABeresClient(config)
        await expect(client.account.getInfo()).rejects.toThrow(APIError);
    })
})


// account resource integration test
describe('account resource integration test', () => {
    // account info
    it('should return object typeof Account', async () => {
        const client = new WABeresClient(config);
        const result = await client.account.getInfo();

        const parsed = AccountSchema.safeParse(result);

        expect(parsed.success).toBe(true);
    })

    it('should return InternalServerError if there is an error about WABeres server', async () => {
        server.use(
            http.get(`${BASE_URL}/api/v1/account/info`, ({ request }) => {
                return HttpResponse.json({ 'error': "internal server error" }, { status: 500 });
            })
        )

        const client = new WABeresClient(config);

        await expect(client.account.getInfo()).rejects.toThrow(InternalServerError);
    })

    // account latest plan choices
    it('should return object typeof AccountPlanChoices', async () => {
        const client = new WABeresClient(config);
        const result = await client.account.getCurrentPlanChoices();

        expect(Array.isArray(result)).toBe(true);

        const parsed = AccountPlanChoicesSchema.safeParse(result[0]);
        expect(parsed.success).toBe(true);
    })

    // account renewal
    it('should return BadRequest because the payment method query search params is missing', async () => {
        const client = new WABeresClient(config);
        
        await expect(client.account.renew()).rejects.toThrow(BadRequestError);
    })

    it('should return UnacceptableError if the payment method is unacceptable', async () => {
        const client = new WABeresClient(config);

        await expect(client.account.renew("something")).rejects.toThrow(UnacceptableError);
    })

    it('should return NotImplemented if the payment method is crypto or something that not implemented yet', async () => {
        const client = new WABeresClient(config);

        await expect(client.account.renew("crypto")).rejects.toThrow(NotImplementedError);
    })

    it('should return object typeof AccountRenew', async () => {
        const client = new WABeresClient(config);
        const result = await client.account.renew("ordinary");

        const parsed = AccountRenewSchema.safeParse(result);
        expect(parsed.success).toBe(true);
    })
})


// device resource integration test
describe('device resource integration test', () => {
    it('should return object typeof Device', async () => {
        const client = new WABeresClient(config);
        const result = await client.devices.getInfo("deviceId");

        const parsed = DeviceSchema.safeParse(result);
        expect(parsed.success).toBe(true);
    })

    it('should return NotFoundError because the device id is not found on the DB', async () => {
        server.use(
            http.get(`${BASE_URL}/api/v1/devices/info`, () => {
                return HttpResponse.json({
                    "error": "Device ID not found",
                    "code": "DEVICE_ID_NOT_FOUND"
                }, { status: 404 })
            })
        )

        const client = new WABeresClient(config);
        await expect(client.devices.getInfo("something_not_found")).rejects.toThrow(NotFoundError);
    })

    it('should return object typeof DeviceConnectQR', async () => {
        const client = new WABeresClient(config);
        const result = await client.devices.connectQR('deviceId');

        const parsed = DeviceConnectQRSchema.safeParse(result);
        expect(parsed.success).toBe(true);
    })

    it('should return ConflictError because the related device id is already connected', async () => {
        server.use(
            http.post(`${BASE_URL}/api/v1/devices/connect/qr`, () => {
                return HttpResponse.json({
                    "error": "device already connected, please check your dashboard",
                    "code": "DEVICE_ALREADY_CONNECTED"
                }, { status: 409 })
            })
        )

        const client = new WABeresClient(config);
        await expect(client.devices.connectQR("connected_deviceId")).rejects.toThrow(ConflictError);
    })

    it('should return object typeof DeviceDisconnect', async () => {
        const client = new WABeresClient(config);
        const result = await client.devices.disconnect("deviceId");

        const parsed = DeviceDisconnectSchema.safeParse(result);
        expect(parsed.success).toBe(true);
    })

    it('should return ConflictError because the related device id is already disconnected', async () => {
        server.use(
            http.post(`${BASE_URL}/api/v1/devices/disconnect`, () => {
                return HttpResponse.json({
                    "error": "device already disconnected, please check your dashboard",
                    "code": "DEVICE_ALREADY_DISCONNECTED"
                }, { status: 409 })
            })
        )

        const client = new WABeresClient(config);
        await expect(client.devices.disconnect("disconnected_deviceId")).rejects.toThrow(ConflictError);
    })
})


// message resource integration test
describe('message resource integration test', () => {
    it('should return object typeof SendMessageResponse', async () => {
        const client = new WABeresClient(config);

        const payload: SendMessagePayload = {
            message: "Test message",
            phone_destination: "623456764767"
        }

        const deviceId = "deviceId";

        const result = await client.messages.send(payload, deviceId);
        const parsed = SendMessageResponseSchema.safeParse(result);

        expect(parsed.success).toBe(true);
    })

    it('should handle rate limit exceeded error 429 with throw a specific custom error class', async () => {
        server.use(
            http.post(`${BASE_URL}/api/v1/messages/send`, () => {
                return HttpResponse.json({
                    "error": "rate limit exceeded",
                    "retry_after_seconds": 60
                }, {
                    status: 429
                })
            })
        )

        const client = new WABeresClient(config);
        
        await expect(client.messages.send({} as SendMessagePayload, "")).rejects.toThrow(RateLimitError);
    })

    it('should return object typeof SendChatPresenceResponse', async () => {
        const client = new WABeresClient(config);

        const payload: SendChatPresenceRequest = {
            phone_destination: "6281234567890",
            action: "start"
        };

        const deviceId = 'deviceId';

        const result = await client.messages.sendChatPresence(payload, deviceId);
        const parsed = SendChatPresenceResponseSchema.safeParse(result);

        expect(parsed.success).toBe(true);
    })
})