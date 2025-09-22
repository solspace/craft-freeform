# PayPal Integration

This integration enables Freeform to connect to PayPal REST APIs for popup-based payments.

## Features
- **Popup Payment Flow**: Uses PayPal SDK for seamless popup-based payments
- **Order Creation**: Creates PayPal orders via REST API
- **Payment Capture**: Captures payments after user approval
- **Dynamic Pricing**: Supports both fixed and dynamic pricing based on form data
- **Sandbox Support**: Full sandbox environment support for testing

## Configuration
- **Client ID**: PayPal App client ID
- **Client Secret**: PayPal App client secret  
- **Use Sandbox**: Toggle for sandbox or live environment

## How It Works
1. User clicks PayPal button on form
2. PayPal popup opens for payment
3. User completes payment in popup
4. Payment is automatically captured
5. Form submission is processed

## API Endpoints
- `POST /freeform/payments/paypal/orders` - Create PayPal order
- `POST /freeform/payments/paypal/orders/{orderId}/capture` - Capture payment

No callback or webhook endpoints needed - everything is handled via the popup flow.



