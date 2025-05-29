"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashfreeService = void 0;
var axios_1 = require("axios");
var supabase_1 = require("../lib/supabase");
var notifications_1 = require("./notifications");
var CashfreeService = /** @class */ (function () {
    function CashfreeService() {
        this.apiKey = process.env.CASHFREE_API_KEY || '';
        this.secretKey = process.env.CASHFREE_SECRET_KEY || '';
        this.baseUrl = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg';
    }
    CashfreeService.prototype.getHeaders = function () {
        return {
            'x-api-version': '2022-09-01',
            'x-client-id': this.apiKey,
            'x-client-secret': this.secretKey,
            'Content-Type': 'application/json'
        };
    };
    CashfreeService.prototype.createPaymentLink = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.post("".concat(this.baseUrl, "/orders"), {
                                order_id: params.orderId,
                                order_amount: params.amount,
                                order_currency: 'USD',
                                customer_details: {
                                    customer_id: params.orderId,
                                    customer_name: params.customerName,
                                    customer_email: params.customerEmail,
                                    customer_phone: params.customerPhone
                                },
                                order_meta: {
                                    return_url: params.returnUrl
                                }
                            }, {
                                headers: this.getHeaders()
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                order_id: response.data.order_id,
                                payment_link: response.data.payment_link
                            }];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error creating payment link:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CashfreeService.prototype.verifyPayment = function (paymentId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/orders/").concat(paymentId), {
                                headers: this.getHeaders()
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.order_status === 'PAID'];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error verifying payment:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CashfreeService.prototype.handleWebhook = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var signature, data, error, updateError, payment, platformFee, freelancerAmount, walletError, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        signature = payload.signature;
                        data = payload.data;
                        return [4 /*yield*/, supabase_1.supabase
                                .from('payment_webhooks')
                                .insert({
                                payment_id: data.order.order_id,
                                event_type: data.event_type,
                                payload: data
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        if (!(data.event_type === 'PAYMENT_SUCCESS')) return [3 /*break*/, 6];
                        return [4 /*yield*/, supabase_1.supabase
                                .from('payments')
                                .update({ status: 'paid', cashfree_payment_id: data.payment.payment_id })
                                .eq('cashfree_payment_link_id', data.order.order_id)];
                    case 2:
                        updateError = (_a.sent()).error;
                        if (updateError)
                            throw updateError;
                        return [4 /*yield*/, supabase_1.supabase
                                .from('payments')
                                .select('amount, project_id, project:projects(freelancer_id)')
                                .eq('cashfree_payment_link_id', data.order.order_id)
                                .single()];
                    case 3:
                        payment = (_a.sent()).data;
                        if (!payment) return [3 /*break*/, 6];
                        platformFee = payment.amount * 0.1;
                        freelancerAmount = payment.amount - platformFee;
                        return [4 /*yield*/, supabase_1.supabase
                                .from('freelancer_wallets')
                                .upsert({
                                freelancer_id: payment.project.freelancer_id,
                                available_balance: freelancerAmount,
                                total_earned: freelancerAmount
                            }, {
                                onConflict: 'freelancer_id'
                            })];
                    case 4:
                        walletError = (_a.sent()).error;
                        if (walletError)
                            throw walletError;
                        // Send notification to freelancer
                        return [4 /*yield*/, notifications_1.notificationsService.sendNotification(payment.project.freelancer_id, "Payment of $".concat(payment.amount, " received for project #").concat(payment.project_id, ". Your wallet has been credited with $").concat(freelancerAmount, "."), 'payment')];
                    case 5:
                        // Send notification to freelancer
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, { success: true }];
                    case 7:
                        error_3 = _a.sent();
                        console.error('Error handling webhook:', error_3);
                        throw error_3;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return CashfreeService;
}());
exports.cashfreeService = new CashfreeService();
