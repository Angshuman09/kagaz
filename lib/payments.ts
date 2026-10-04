import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const getConvexClient = () => {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set in environment variables");
  }
  return new ConvexHttpClient(convexUrl);
};

export interface SubscriptionStatusOptions {
  status: "active" | "cancelled" | "expired" | "failed";
  subscriptionId?: string;
  customerId?: string;
  paymentId?: string;
  email?: string;
}

/**
 * Updates the user's upgrade status and payment/subscription metadata in Convex.
 */
export async function updateSubscriptionStatus(
  identifier: string,
  options: SubscriptionStatusOptions
) {
  try {
    const convex = getConvexClient();
    const isUpgraded = options.status === "active";
    const email = options.email || (identifier.includes("@") ? identifier : undefined);

    if (email) {
      // Update user plan status
      await convex.mutation(api.user.upgradeUser, {
        email,
        upgrade: isUpgraded,
      });

      // Update Dodo Payments details if available
      if (options.subscriptionId || options.customerId || options.paymentId) {
        await convex.mutation(api.user.updateDodoInfo, {
          email,
          subscriptionId: options.subscriptionId,
          customerId: options.customerId,
          paymentId: options.paymentId,
        });
      }

      console.log(`[Dodo Payments] Successfully updated subscription status for ${email}: upgrade=${isUpgraded}`);
    } else {
      console.warn(`[Dodo Payments] Could not resolve email for identifier: ${identifier}`);
    }
  } catch (error) {
    console.error("[Dodo Payments] Error updating subscription status in Convex:", error);
    throw error;
  }
}