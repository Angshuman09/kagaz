import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const body = await req.text(); // ⚠️ raw body needed
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.log("❌ Invalid webhook signature");
    return new NextResponse("Webhook error", { status: 400 });
  }

  // 🎯 SUCCESSFUL PAYMENT
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const userId = paymentIntent.metadata.userId;

    console.log("💰 Payment success for:", userId);

    await convex.mutation("user:upgradeUser", { userId });
  }

  return NextResponse.json({ received: true });
}
