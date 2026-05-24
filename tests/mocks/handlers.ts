import { DefaultBodyType, http, HttpResponse, StrictRequest } from 'msw';

export const BASE_URL = 'https://example-waberes.com';
export const DUMMY_API_KEY = "waberes_xxx";

const mockMiddleware = (request: StrictRequest<DefaultBodyType>) => {
    const apiKey = request.headers.get('X-API-Key');

    // mock api key is not found at database
    if(apiKey !== DUMMY_API_KEY) {
        return HttpResponse.json({
            "error": "invalid api key!"
        }, { status: 403 })
    }
}

export const handlers = [
    // accounts
    http.get(`${BASE_URL}/api/v1/account/info`, ({ request }) => {
        const middlewareResult = mockMiddleware(request);

        if(middlewareResult !== undefined) {
            return middlewareResult;
        }

        return HttpResponse.json({
            "days_left": 30,
            "expiry_date": "",
            "initial_quota": "1",
            "plan": "<string>",
            "plan_type": "TIME_BASED",
            "remaining_quota": "1",
            "session_id": "<random_uuid>",
            "start_date": "",
            "user_id": "user_jkjfuiwpoiuroiqt61276"
        }, { status: 200 });
    }),

    http.get(`${BASE_URL}/api/v1/account/planchoices/latest`, ({ request }) => {
        const middlewareResult = mockMiddleware(request);

        if(middlewareResult !== undefined) {
            return middlewareResult;
        }

        return HttpResponse.json([
            {
                "duration": "7 hari",
                "plan_name": "starter",
                "plan_type": "TIME_BASED",
                "price": 50000,
                "quota": "Unlimited"
            }
        ], { status: 200 });
    }),

    http.post(`${BASE_URL}/api/v1/account/renew`, ({ request }) => {
        const middlewareResult = mockMiddleware(request);

        if(middlewareResult !== undefined) {
            return middlewareResult;
        }

        const url = new URL(request.url);
        const method = url.searchParams.get("method")

        if(method === ""){
            return HttpResponse.json({
                "error": "Payment Method query param is required!",
                "code": "PAYMENT_METHOD_MISSING"
            }, { status: 400 });
        }

        if(method !== "ordinary" && method !== "crypto") {
            return HttpResponse.json({
                "error": "Payment method not acceptable",
                "code": "PAYMENT_METHOD_NOT_ACCEPTABLE"
            }, { status: 406 })
        }

        if(method === "crypto") {
            return HttpResponse.json({
                "error": "Payment method not implemented! Let us know if you prefer crypto payment method for fully automated renewal system at waberes@gmail.com",
                "code": "PAYMENT_METHOD_NOT_IMPLEMENTED"
            }, { status: 501 })
        }

        return HttpResponse.json({
            "description": "Account renewal for Plan: <your_plan> | UserID=<your_user_id> is successfully created, waiting for payment...",
            "payment_url": "https://paymentgateway.com/payment/ref=DGHFYUH8787967"
        }, { status: 200 });
    }),
    

    // devices
    http.get(`${BASE_URL}/api/v1/devices/info`, ({ request }) => {
        const middlewareResult = mockMiddleware(request);

        if(middlewareResult !== undefined) {
            return middlewareResult;
        }

        const deviceId = request.headers.get('X-Device-ID')

        if(!deviceId) {
            return HttpResponse.json({
                "error": "Missing Device ID",
                "code": "MISSING_DEVICE_ID_HEADER"
            }, { status: 400 })
        }

        return HttpResponse.json({
            "created_at": "<string>",
            "device_id": "01GAHGDYTRIUGIDUYFI",
            "state": "disconnected"
        }, { status: 200 });
    }),

    http.post(`${BASE_URL}/api/v1/devices/connect/qr`, ({ request }) => {
        const middlewareResult = mockMiddleware(request);

        if(middlewareResult !== undefined) {
            return middlewareResult;
        }

        const deviceId = request.headers.get('X-Device-ID')

        if(!deviceId) {
            return HttpResponse.json({
                "error": "Missing Device ID",
                "code": "MISSING_DEVICE_ID_HEADER"
            }, { status: 400 })
        }

        return HttpResponse.json({
            "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...",
            "qr_duration": 30
        }, { status: 200 });
    }),

    http.post(`${BASE_URL}/api/v1/devices/disconnect`, ({ request }) => {
        const middlewareResult = mockMiddleware(request);

        if(middlewareResult !== undefined) {
            return middlewareResult;
        }

        const deviceId = request.headers.get('X-Device-ID')

        if(!deviceId) {
            return HttpResponse.json({
                "error": "Missing Device ID",
                "code": "MISSING_DEVICE_ID_HEADER"
            }, { status: 400 })
        }

        return HttpResponse.json({
            "device_id": "01YAUTFIUYASDFIAUSY",
            "msg": "device has successfully disconnected"
        }, { status: 200 });
    }),
    
    // messages
    http.post(`${BASE_URL}/api/v1/messages/send`, ({ request }) => {
        const middlewareResult = mockMiddleware(request);

        if(middlewareResult !== undefined) {
            return middlewareResult;
        }

        const deviceId = request.headers.get('X-Device-ID')

        if(!deviceId) {
            return HttpResponse.json({
                "error": "Missing Device ID",
                "code": "MISSING_DEVICE_ID_HEADER"
            }, { status: 400 })
        }

        return HttpResponse.json({
            "job_id": "adfs892536",
            "msg": "send message request enqueued!"
        }, { status: 202 });
    })
]