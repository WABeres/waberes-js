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

    getInfo() {
        return this.client.get<Account>(`${this.path}/info`);
    }

    getCurrentPlanChoices() {
        return this.client.get<AccountPlanChoices[]>(`${this.path}/planchoices/latest`);
    }

    renew(paymentMethod?: string) {
        return this.client.post<AccountRenew>(`${this.path}/renew?method=${paymentMethod === undefined ? '' : paymentMethod}`, undefined);
    }
}