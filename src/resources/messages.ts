import { BaseResource } from "./base";
import { z } from "zod";

export const SendMessagePayloadSchema = z.object({
    message: z.string(),
    phone_destination: z.string()
})

export type SendMessagePayload = z.infer<typeof SendMessagePayloadSchema> 

export const SendMessageResponseSchema = z.object({
    job_id: z.string(),
    msg: z.string()
})

export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema> 

export class MessageResource extends BaseResource {
    private readonly path = '/api/v1/messages';

    /**
     * @author Fredo Ronan - <fredocode06@gmail.com>
     * @param payload 
     * @param deviceId 
     * @returns SendMessageResponse
     * 
     * Mengirim pesan whatsapp ke nomor tujuan
     */
    send(payload: SendMessagePayload, deviceId: string) {
        return this.client.post<SendMessageResponse>(`${this.path}/send`, payload, { 'X-Device-ID': deviceId });
    }
}