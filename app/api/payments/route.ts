import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const POST = async (req: NextRequest)=>{
    const payload = await req.text();

    const sig = req.headers.get('stripe-signature');

    let event;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    try {
        event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret)

        switch (event.type){
            case 'checkout.session.completed':
                console.log("checkout sesssion completed");
                const session = event.data.object;
                console.log(session);
                break;

            case 'customer.subscription.deleted':
                console.log("customer subscription deleted");
                const subscription = event.data.object;
                console.log(subscription);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`)
        }
        
    } catch (error) {
        console.log(error);
        NextResponse.json({error:`Failed to trigger webhook ${error}`}, {status:400})
    }

    return NextResponse.json({
        status: "success"
    })
}