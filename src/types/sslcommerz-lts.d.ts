declare module 'sslcommerz-lts' {
    interface SSLCommerzPaymentOptions {
        store_id: string;
        store_passwd: string;
        is_live: boolean;
    }

    interface InitiatePaymentData {
        total_amount: number | string;
        currency: string;
        tran_id: string;
        success_url: string;
        fail_url: string;
        cancel_url: string;
        ipn_url?: string;
        shipping_method?: string;
        product_name?: string;
        product_category?: string;
        product_profile?: string;
        cus_name?: string;
        cus_email?: string;
        cus_add1?: string;
        cus_add2?: string;
        cus_city?: string;
        cus_state?: string;
        cus_postcode?: string;
        cus_country?: string;
        cus_phone?: string;
        cus_fax?: string;
        ship_name?: string;
        ship_add1?: string;
        ship_add2?: string;
        ship_city?: string;
        ship_state?: string;
        ship_postcode?: string;
        ship_country?: string;
        value_a?: string;
        value_b?: string;
        value_c?: string;
        value_d?: string;
        [key: string]: unknown;
    }

    interface InitiatePaymentResponse {
        status: string;
        failedreason?: string;
        sessionkey?: string;
        gw?: Record<string, unknown>;
        redirectGatewayURL?: string;
        directPaymentURLBank?: string;
        directPaymentURLCard?: string;
        directPaymentURL?: string;
        redirectGatewayURLFailed?: string;
        GatewayPageURL?: string;
        storeBanner?: string;
        storeLogo?: string;
        store_name?: string;
        desc?: Array<{
            name: string;
            type: string;
            logo: string;
            gw: string;
        }>;
        is_direct_pay_enable?: string;
        [key: string]: unknown;
    }

    interface ValidatePaymentResponse {
        status: string;
        tran_date?: string;
        tran_id?: string;
        val_id?: string;
        amount?: string;
        store_amount?: string;
        currency?: string;
        bank_tran_id?: string;
        card_type?: string;
        card_no?: string;
        card_issuer?: string;
        card_brand?: string;
        card_sub_brand?: string;
        card_issuer_country?: string;
        card_issuer_country_code?: string;
        currency_type?: string;
        currency_amount?: string;
        currency_rate?: string;
        base_fair?: string;
        value_a?: string;
        value_b?: string;
        value_c?: string;
        value_d?: string;
        risk_level?: string;
        risk_title?: string;
        [key: string]: unknown;
    }

    class SSLCommerzPayment {
        constructor(
            store_id: string,
            store_passwd: string,
            is_live: boolean
        );

        init(data: InitiatePaymentData): Promise<InitiatePaymentResponse>;
        validate(data: { val_id: string }): Promise<ValidatePaymentResponse>;
        initiatePayment(data: InitiatePaymentData): Promise<InitiatePaymentResponse>;
        orderValidate(
            data: Record<string, unknown>,
            tran_id: string,
            amount: number | string,
            currency: string
        ): Promise<ValidatePaymentResponse>;
    }

    export = SSLCommerzPayment;
}
