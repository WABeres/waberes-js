import { describe, expect, it, vi } from "vitest";
import { WABeresClient } from "../../src/client";
import type { SDKConfig } from "../../src/types";
import { DUMMY_API_KEY } from "../mocks/handlers";

describe('Account Resource', () => {
    it('getInfo() is really called with GET /api/v1/account/info', async () => {
        const clientConfig: SDKConfig = {
            apiKey: DUMMY_API_KEY,
            secretKey: "dummy"
        }
        const client = new WABeresClient(clientConfig);
        const spy = vi.spyOn(client, 'get').mockResolvedValue([]);

        await client.account.getInfo();

        expect(spy).toHaveBeenCalledWith("/api/v1/account/info");
    })

    it('getCurrentPlanChoices() is really called with GET /api/v1/account/planchoices/latest', async () => {
        const clientConfig: SDKConfig = {
            apiKey: DUMMY_API_KEY,
            secretKey: "dummy"
        }
        const client = new WABeresClient(clientConfig);
        const spy = vi.spyOn(client, 'get').mockResolvedValue([]);

        await client.account.getCurrentPlanChoices();

        expect(spy).toHaveBeenCalledWith("/api/v1/account/planchoices/latest");
    })

    it('renew() is really called with POST /api/v1/account/renew?method=', async () => {
        const clientConfig: SDKConfig = {
            apiKey: DUMMY_API_KEY,
            secretKey: "dummy"
        }
        const client = new WABeresClient(clientConfig);
        const spy = vi.spyOn(client, 'post').mockResolvedValue({});

        const paymentMethod = "ordinary";

        await client.account.renew(paymentMethod);

        expect(spy).toHaveBeenCalledWith("/api/v1/account/renew?method=" + paymentMethod, undefined);
    })
})