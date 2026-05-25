import { BaseResource } from "./base";
import { z } from 'zod';

export const AccountSchema = z.object({
    days_left: z.number(),
    start_date: z.string(),
    expiry_date: z.string(),
    initial_quota: z.string(),
    remaining_quota: z.string(),
    plan: z.string(),
    plan_type: z.string(),
    session_id: z.string(),
    user_id: z.string()
});

export type Account = z.infer<typeof AccountSchema>

export const AccountPlanChoicesSchema = z.object({
    duration: z.string(),
    plan_name: z.string(),
    plan_type: z.string(),
    price: z.number(),
    quota: z.string()
})

export type AccountPlanChoices = z.infer<typeof AccountPlanChoicesSchema>

export const AccountRenewSchema = z.object({
    payment_url: z.string(),
    description: z.string()
})
export type AccountRenew = z.infer<typeof AccountRenewSchema> 

export class AccountResource extends BaseResource {
    private readonly path = '/api/v1/account';

    /**
     * @author Fredo Ronan - <fredocode06@gmail.com>
     * @returns Account
     * 
     * Mendapatkan info tentang akun anda
     */
    getInfo() {
        return this.client.get<Account>(`${this.path}/info`);
    }

    /**
     * @author Fredo Ronan - <fredocode06@gmail.com>
     * @returns AccountPlanChoices
     * 
     * Mendapatkan informasi harga terbaru paket - paket yang tersedia
     */
    getCurrentPlanChoices() {
        return this.client.get<AccountPlanChoices[]>(`${this.path}/planchoices/latest`);
    }

    /**
     * @author Fredo Ronan - <fredocode06@gmail.com>
     * @param paymentMethod 
     * @returns AccountRenew
     * 
     * Memperpanjang masa aktif paket durasi anda (hanya paket durasi yang boleh di perpanjang, tidak ada mekanisme top up kuota pesan)
     */
    renew(paymentMethod?: string) {
        return this.client.post<AccountRenew>(`${this.path}/renew?method=${paymentMethod === undefined ? '' : paymentMethod}`, undefined);
    }
}