import { BaseResource } from "./base";
import { z } from "zod";

export const DeviceSchema = z.object({
    device_id: z.string(),
    state: z.string(),
    created_at: z.string()
})

export type Device = z.infer<typeof DeviceSchema> 

export const DeviceConnectQRSchema = z.object({
    qr_code: z.string(),
    qr_duration: z.number()
})

export type DeviceConnectQR = z.infer<typeof DeviceConnectQRSchema> 

export const DeviceDisconnectSchema = z.object({
    device_id: z.string(),
    msg: z.string()
})

export type DeviceDisconnect = z.infer<typeof DeviceDisconnectSchema>

export class DevicesResource extends BaseResource {
    private readonly path = "/api/v1/devices";

    getInfo(deviceId: string) {
        return this.client.get<Device>(`${this.path}/info`, { 'X-Device-ID': deviceId });
    }

    connectQR(deviceId: string) {
        return this.client.post<DeviceConnectQR>(`${this.path}/connect/qr`, undefined, { 'X-Device-ID': deviceId });
    }

    disconnect(deviceId: string) {
        return this.client.post<DeviceDisconnect>(`${this.path}/disconnect`, undefined, { 'X-Device-ID': deviceId });
    }
}