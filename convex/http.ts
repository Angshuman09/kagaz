// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, components } from "./_generated/api";
import { registerRoutes } from "@convex-dev/stripe";

const http = httpRouter();

// Register Stripe webhook handler at /stripe/webhook
registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
  events: {
    // When checkout is completed, upgrade the user
    "checkout.session.completed": async (ctx, event) => {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email || session.customer_email;
      
      if (customerEmail) {
        console.log(`Checkout completed for ${customerEmail}`);
        
        // Update user to pro status
        await ctx.runMutation(api.user.upgradeUser, {
          email: customerEmail,
          upgrade: true,
        });
        
        // Store Stripe customer and subscription IDs if available
        if (session.customer && session.subscription) {
          await ctx.runMutation(api.user.updateStripeInfo, {
            email: customerEmail,
            stripeCustomerId: session.customer as string,
            subscriptionId: session.subscription as string,
          });
        }
        
        // For one-time payments, we might just want to store the customer ID
        if (session.customer && !session.subscription) {
             await ctx.runMutation(api.user.updateStripeInfo, {
            email: customerEmail,
            stripeCustomerId: session.customer as string,
          });
        }
        
        console.log(`User ${customerEmail} upgraded successfully`);
      }
    },
    
    // When subscription is created
    "customer.subscription.created": async (ctx, event) => {
      const subscription = event.data.object;
      console.log(`Subscription created: ${subscription.id}`);
    },
    
    // When subscription is updated (status changes, etc.)
    "customer.subscription.updated": async (ctx, event) => {
      const subscription = event.data.object;
      console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);
      
      // If subscription becomes inactive, downgrade the user
      if (subscription.status === 'canceled' || subscription.status === 'unpaid' || subscription.status === 'incomplete_expired') {
        const customerId = subscription.customer as string;
        
        // Find user by Stripe customer ID
        const user = await ctx.runQuery(api.user.getUserByStripeCustomerId, {
          stripeCustomerId: customerId,
        });
        
        if (user) {
          await ctx.runMutation(api.user.upgradeUser, {
            email: user.email,
            upgrade: false,
          });
          
          console.log(`User ${user.email} downgraded due to subscription status: ${subscription.status}`);
        }
      }
    },
    
    // When subscription is deleted/canceled
    "customer.subscription.deleted": async (ctx, event) => {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      
      console.log(`Subscription deleted: ${subscription.id}`);
      
      // Find user by Stripe customer ID
      const user = await ctx.runQuery(api.user.getUserByStripeCustomerId, {
        stripeCustomerId: customerId,
      });
      
      if (user) {
        // Downgrade the user
        await ctx.runMutation(api.user.upgradeUser, {
          email: user.email,
          upgrade: false,
        });
        
        console.log(`User ${user.email} downgraded after subscription deletion`);
      }
    },
  },
});

// Custom route for upgrading users
http.route({
  path: "/stripe/upgrade-user",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { email, upgrade } = await request.json();
      
      console.log("Convex HTTP action received:", { email, upgrade });
      
      // This runs with proper authentication
      const result = await ctx.runMutation(api.user.upgradeUser, {
        email,
        upgrade,
      });
      
      console.log("Mutation completed:", result);
      
      return new Response(JSON.stringify({ success: true, result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Convex mutation error:", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }), 
        { status: 500 }
      );
    }
  }),
});

http.route({
  path: "/dodo/upgrade-user",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { email, upgrade, customerId, subscriptionId, paymentId } = await request.json();
      
      console.log("Convex Dodo HTTP action received:", { email, upgrade });
      
      const result = await ctx.runMutation(api.user.upgradeUser, {
        email,
        upgrade,
      });

      if (customerId || subscriptionId || paymentId) {
        await ctx.runMutation(api.user.updateDodoInfo, {
          email,
          customerId,
          subscriptionId,
          paymentId,
        });
      }
      
      return new Response(JSON.stringify({ success: true, result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Convex Dodo upgrade error:", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }), 
        { status: 500 }
      );
    }
  }),
});

export default http;