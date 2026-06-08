import { createHmac } from "crypto";
import { verifyWebhookSignature } from "../src/auth";
import { describe, expect, it } from "vitest";

// helper for generating a valid signature
function generateSignature(
    payload: string,
    webhookId: string,
    timestamp: string,
    secretKey: string
): string {
    return createHmac('sha256', secretKey)
        .update(webhookId + timestamp)
        .update(payload, 'utf-8')
        .digest('hex')
}


describe('verifyWebhookSignature', () => {
    const secret = 'dummy';
    const webhookId = '1';
    const timestamp = '1717000000';
    const payload = JSON.stringify({});

    describe('valid signature', () => {
        it('should return true for correct signature', () => {
            const signature = generateSignature(payload, webhookId, timestamp, secret);
            expect(verifyWebhookSignature(payload, signature, webhookId, timestamp, secret)).toBe(true);
        });

        it('should return true for an empty payload', () => {
            const emptyPayload = '';
            const signature = generateSignature(emptyPayload, webhookId, timestamp, secret);
            expect(verifyWebhookSignature(emptyPayload, signature, webhookId, timestamp, secret)).toBe(true);
        });

        it('should return true for a payload with unicode characters', () => {
            const unicodePayload = JSON.stringify({ message: 'konfirmasi pembayaran ✓' });
            const signature = generateSignature(unicodePayload, webhookId, timestamp, secret);
            expect(verifyWebhookSignature(unicodePayload, signature, webhookId, timestamp, secret)).toBe(true);
        });
    });

    describe('invalid signature', () => {
        it('should return false for a tampered payload', () => {
            const signature = generateSignature(payload, webhookId, timestamp, secret);
            const tamperedPayload = JSON.stringify({ event: 'payment success', amount: 9999999 });
            expect(verifyWebhookSignature(tamperedPayload, signature, webhookId, timestamp, secret)).toBe(false);
        });

        it('should return false for wrong secret', () => {
            const signature = generateSignature(payload, webhookId, timestamp, secret);
            expect(verifyWebhookSignature(payload, signature, webhookId, timestamp, 'wrong-secret')).toBe(false);
        });

        it('should return false for a wrong webhook id', () => {
            const signature = generateSignature(payload, webhookId, timestamp, secret);
            expect(verifyWebhookSignature(payload, signature, 'different', timestamp, secret)).toBe(false);
        });

        it('should return false for a wrong timestamp', () => {
            const signature = generateSignature(payload, webhookId, timestamp, secret);
            expect(verifyWebhookSignature(payload, signature, webhookId, '999999999', secret)).toBe(false);
        });

        it('should return false for a signature with wrong length', () => {
            expect(verifyWebhookSignature(payload, 'asdfg', webhookId, timestamp, secret)).toBe(false);
        });

        it('should return false for an all-zero signature', () => {
            const zeroSig = '0'.repeat(64);
            expect(verifyWebhookSignature(payload, zeroSig, webhookId, timestamp, secret)).toBe(false);
        });
    });

    describe('missing/null/undefined parameters', () => {
        it('should return false when signature is undefined', () => {
            expect(verifyWebhookSignature(payload, undefined, webhookId, timestamp, secret)).toBe(false);
        });

        it('should return false when signature is null', () => {
            expect(verifyWebhookSignature(payload, null, webhookId, timestamp, secret)).toBe(false);
        });

        it('should return false when signature is an empty string', () => {
            expect(verifyWebhookSignature(payload, '', webhookId, timestamp, secret)).toBe(false);
        });

        it('should return false when webhookId is undefined', () => {
            const signature = generateSignature(payload, webhookId, timestamp, secret);
            expect(verifyWebhookSignature(payload, signature, undefined, timestamp, secret)).toBe(false);
        });

        it('should return false when webhookId is null', () => {
            const signature = generateSignature(payload, webhookId, timestamp, secret);
            expect(verifyWebhookSignature(payload, signature, null, timestamp, secret)).toBe(false);
        });

        it('should return false when webhookId is an empty string', () => {
            const signature = generateSignature(payload, webhookId, timestamp, secret);
            expect(verifyWebhookSignature(payload, signature, '', timestamp, secret)).toBe(false);
        });

        it('should return false when timestamp is undefined', () => {
            const signature = generateSignature(payload, webhookId, timestamp, secret);
            expect(verifyWebhookSignature(payload, signature, webhookId, undefined, secret)).toBe(false);
        });

        it('should return false when timestamp is null', () => {
            const signature = generateSignature(payload, webhookId, timestamp, secret);
            expect(verifyWebhookSignature(payload, signature, webhookId, null, secret)).toBe(false);
        });

        it('should return false when timestamp is an empty string', () => {
            const signature = generateSignature(payload, webhookId, timestamp, secret);
            expect(verifyWebhookSignature(payload, signature, webhookId, '', secret)).toBe(false);
        });

        it('should return false when all optional params are null', () => {
            expect(verifyWebhookSignature(payload, null, null, null, secret)).toBe(false);
        });
    });
});