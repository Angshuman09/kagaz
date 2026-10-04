"use client";

import { DodoPayments } from "dodopayments-checkout";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CheckoutButtonProps {
  productId?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function CheckoutButton({
  productId = process.env.NEXT_PUBLIC_DODO_PRODUCT_ID || "pdt_0Np0uOEX0S3ENoriL45Hf",
  className,
  children,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Initialize the SDK once when the component mounts
    const mode = (process.env.NEXT_PUBLIC_DODO_PAYMENTS_MODE || "test") as "test" | "live";
    DodoPayments.Initialize({
      mode,
      onEvent: (event) => {
        if (event.event_type === "checkout.opened") {
          setIsLoading(false);
        } else if (event.event_type === "checkout.error") {
          setIsLoading(false);
          console.error("Checkout error:", event.data);
          toast.error("Checkout failed. Please try again.");
        } else if (event.event_type === "checkout.closed") {
          setIsLoading(false);
        }
      },
    });
  }, []);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to upgrade");
      router.push("/sign-in");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          customer: {
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName || user.firstName || "Customer",
          },
          metadata: {
            userId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.checkout_url) {
        throw new Error(data.error || data.message || "Failed to create checkout session");
      }

      await DodoPayments.Checkout.open({
        checkoutUrl: data.checkout_url,
      });
    } catch (error: unknown) {
      console.error("Failed to open checkout:", error);
      const message = error instanceof Error ? error.message : "Failed to open checkout. Please try again.";
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Processing..." : (children || "Upgrade Now")}
    </button>
  );
}
