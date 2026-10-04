import { Checkout } from "@dodopayments/nextjs";
import { NextRequest, NextResponse } from "next/server";

const environment = (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode";
const bearerToken = process.env.DODO_PAYMENTS_API_KEY!;
const returnUrl = process.env.DODO_PAYMENTS_RETURN_URL;

// Static / GET checkout handler
export const GET = Checkout({
  bearerToken,
  returnUrl,
  environment,
  type: "static",
});

// Internal session handler from @dodopayments/nextjs
const dodoSessionCheckout = Checkout({
  bearerToken,
  returnUrl,
  environment,
  type: "session",
});

export const POST = async (req: NextRequest) => {
  try {
    const rawBody = await req.json().catch(() => ({}));

    // Resolve productId from request or environment
    const productId =
      rawBody.productId ||
      rawBody.product_id ||
      process.env.DODO_PRODUCT_ID ||
      process.env.NEXT_PUBLIC_DODO_PRODUCT_ID;

    // Normalizing payload for Dodo Checkout Session
    const productCart =
      Array.isArray(rawBody.product_cart) && rawBody.product_cart.length > 0
        ? rawBody.product_cart
        : productId
        ? [{ product_id: productId, quantity: rawBody.quantity || 1 }]
        : [];

    if (productCart.length === 0) {
      return NextResponse.json(
        { error: "Product ID or product_cart is required" },
        { status: 400 }
      );
    }

    const sessionPayload: Record<string, unknown> = {
      product_cart: productCart,
      return_url: rawBody.returnUrl || rawBody.return_url || returnUrl,
    };

    if (rawBody.customer) {
      sessionPayload.customer = rawBody.customer;
    }
    if (rawBody.billing_address) {
      sessionPayload.billing_address = rawBody.billing_address;
    }
    if (rawBody.metadata) {
      sessionPayload.metadata = rawBody.metadata;
    }

    // Forward formatted payload to Dodo's checkout session handler
    const syntheticReq = new NextRequest(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify(sessionPayload),
    });

    return await dodoSessionCheckout(syntheticReq);
  } catch (error: unknown) {
    console.error("[Dodo Checkout] Error creating checkout session:", error);
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
};