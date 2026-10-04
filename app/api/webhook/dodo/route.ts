import { Webhooks } from "@dodopayments/nextjs";
import { updateSubscriptionStatus } from "@/lib/payments";

const webhookKey =
  process.env.DODO_PAYMENTS_WEBHOOK_SECRET ||
  process.env.DODO_PAYEMENTS_WEBHOOK_KEY ||
  process.env.DODO_WEBHOOK_SECRET ||
  "";

export const POST = Webhooks({
  webhookKey,

  onPaymentSucceeded: async (payload) => {
    try {
      console.log("[Dodo Webhook] Payment Succeeded:", payload.data.payment_id);
      const { customer, payment_id, subscription_id, metadata } = payload.data;
      const email = customer?.email || (metadata?.email as string | undefined);

      if (email) {
        await updateSubscriptionStatus(email, {
          status: "active",
          email,
          customerId: customer?.customer_id,
          paymentId: payment_id,
          subscriptionId: subscription_id ?? undefined,
        });
      } else {
        console.warn("[Dodo Webhook] No email found in payment.succeeded payload:", payload.data);
      }
    } catch (err) {
      console.error("[Dodo Webhook] Error processing onPaymentSucceeded:", err);
    }
  },

  onSubscriptionActive: async (payload) => {
    try {
      console.log("[Dodo Webhook] Subscription Active:", payload.data.subscription_id);
      const { customer, subscription_id, metadata } = payload.data;
      const email = customer?.email || (metadata?.email as string | undefined);

      if (email) {
        await updateSubscriptionStatus(email, {
          status: "active",
          email,
          customerId: customer?.customer_id,
          subscriptionId: subscription_id,
        });
      } else {
        console.warn("[Dodo Webhook] No email found in subscription.active payload:", payload.data);
      }
    } catch (err) {
      console.error("[Dodo Webhook] Error processing onSubscriptionActive:", err);
    }
  },

  onSubscriptionRenewed: async (payload) => {
    try {
      console.log("[Dodo Webhook] Subscription Renewed:", payload.data.subscription_id);
      const { customer, subscription_id, metadata } = payload.data;
      const email = customer?.email || (metadata?.email as string | undefined);

      if (email) {
        await updateSubscriptionStatus(email, {
          status: "active",
          email,
          customerId: customer?.customer_id,
          subscriptionId: subscription_id,
        });
      }
    } catch (err) {
      console.error("[Dodo Webhook] Error processing onSubscriptionRenewed:", err);
    }
  },

  onSubscriptionCancelled: async (payload) => {
    try {
      console.log("[Dodo Webhook] Subscription Cancelled:", payload.data.subscription_id);
      const { customer, metadata } = payload.data;
      const email = customer?.email || (metadata?.email as string | undefined);

      if (email) {
        await updateSubscriptionStatus(email, {
          status: "cancelled",
          email,
        });
      }
    } catch (err) {
      console.error("[Dodo Webhook] Error processing onSubscriptionCancelled:", err);
    }
  },

  onSubscriptionExpired: async (payload) => {
    try {
      console.log("[Dodo Webhook] Subscription Expired:", payload.data.subscription_id);
      const { customer, metadata } = payload.data;
      const email = customer?.email || (metadata?.email as string | undefined);

      if (email) {
        await updateSubscriptionStatus(email, {
          status: "expired",
          email,
        });
      }
    } catch (err) {
      console.error("[Dodo Webhook] Error processing onSubscriptionExpired:", err);
    }
  },

  onSubscriptionPaused: async (payload) => {
    try {
      console.log("[Dodo Webhook] Subscription Paused:", payload.data.subscription_id);
      const { customer, metadata } = payload.data;
      const email = customer?.email || (metadata?.email as string | undefined);

      if (email) {
        await updateSubscriptionStatus(email, {
          status: "cancelled",
          email,
        });
      }
    } catch (err) {
      console.error("[Dodo Webhook] Error processing onSubscriptionPaused:", err);
    }
  },

  onRefundSucceeded: async (payload) => {
    try {
      console.log("[Dodo Webhook] Refund Succeeded:", payload.data.refund_id);
      const { customer, metadata } = payload.data;
      const email = customer?.email || (metadata?.email as string | undefined);

      if (email) {
        await updateSubscriptionStatus(email, {
          status: "cancelled",
          email,
        });
      }
    } catch (err) {
      console.error("[Dodo Webhook] Error processing onRefundSucceeded:", err);
    }
  },
});