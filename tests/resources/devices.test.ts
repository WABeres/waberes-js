import { describe, expect, it, vi } from "vitest";
import { WABeresClient } from "../../src/client";
import type { SDKConfig } from "../../src/types";
import { DUMMY_API_KEY } from "../mocks/handlers";

describe('Devices Resources', () => {
    it('getInfo() is really called with path: /api/v1/devices/info and X-Device-ID header', async () => {
        const clientConfig: SDKConfig = {
            apiKey: DUMMY_API_KEY,
            secretKey: "dummy"
        }
        const client = new WABeresClient(clientConfig);
        const spy = vi.spyOn(client, 'get').mockResolvedValue([]);

        const deviceId = "deviceId";

        await client.devices.getInfo(deviceId);

        expect(spy).toHaveBeenCalledWith("/api/v1/devices/info", { 'X-Device-ID': deviceId });
    })

    it('connectQR() is really called with path: /api/v1/devices/connect/qr, undefined body and X-Device-ID header', async () => {
        const clientConfig: SDKConfig = {
            apiKey: DUMMY_API_KEY,
            secretKey: "dummy"
        }
        const client = new WABeresClient(clientConfig);
        const spy = vi.spyOn(client, 'post').mockResolvedValue([]);

        const deviceId = "deviceId"

        await client.devices.connectQR(deviceId);

        expect(spy).toHaveBeenCalledWith("/api/v1/devices/connect/qr", undefined, { 'X-Device-ID': deviceId });
    })

    it('disconnect() is really called with path: /api/v1/devices/disconnect, undefined body and X-Device-ID header', async () => {
        const clientConfig: SDKConfig = {
            apiKey: DUMMY_API_KEY,
            secretKey: "dummy"
        }
        const client = new WABeresClient(clientConfig);
        const spy = vi.spyOn(client, 'post').mockResolvedValue([]);

        const deviceId = "deviceId"

        await client.devices.disconnect(deviceId);

        expect(spy).toHaveBeenCalledWith("/api/v1/devices/disconnect", undefined, { 'X-Device-ID': deviceId });
    })
})