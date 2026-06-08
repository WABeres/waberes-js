import { describe, expect, it, vi } from "vitest";
import { WABeresClient } from "../../src/client";
import type { SDKConfig } from "../../src/types";
import { DUMMY_API_KEY } from "../mocks/handlers";
import { SendChatPresenceRequest, SendMessagePayload } from "../../src/resources/messages";

describe('Message Resource', () => {
    it('send() is really called with path: /api/v1/messages/send, SendMessagePayload and X-Device-ID header', async () => {
        const config: SDKConfig = {
            apiKey: DUMMY_API_KEY,
            secretKey: "xxx"
        };
        const client = new WABeresClient(config);
        const spy = vi.spyOn(client, 'post').mockResolvedValue([]);

        const deviceId = 'deviceId';

        await client.messages.send({} as SendMessagePayload, deviceId);

        expect(spy).toHaveBeenCalledWith("/api/v1/messages/send", {} as SendMessagePayload, { 'X-Device-ID': deviceId });
    })

    it('sendChatPresence() is really called with path: /api/v1/messages/send/chat-presence, SendChatPresenceRequest and X-Device-ID header', async () => {
        const config: SDKConfig = {
            apiKey: DUMMY_API_KEY,
            secretKey: "xxx"
        };

        const client = new WABeresClient(config);
        const spy = vi.spyOn(client, 'post').mockResolvedValue([]);

        const deviceId = 'deviceId';

        await client.messages.sendChatPresence({} as SendChatPresenceRequest, deviceId);

        expect(spy).toHaveBeenCalledWith("/api/v1/messages/send/chat-presence", {} as SendChatPresenceRequest, { 'X-Device-ID': deviceId });
    })
})