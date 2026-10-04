"use client";
import ShinyText from "@/components/ShinyText";
import { useRouter } from "next/navigation";
import { DodoPayments } from "dodopayments-checkout";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

const Pricing = () => {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const mode = (process.env.NEXT_PUBLIC_DODO_PAYMENTS_MODE || "test") as "test" | "live";
    DodoPayments.Initialize({
      mode,
      onEvent: (event) => {
        if (event.event_type === "checkout.opened") {
          setIsLoading(false);
        } else if (event.event_type === "checkout.error") {
          setIsLoading(false);
          console.error("Checkout error:", event.data);
          toast.error("Checkout error. Please try again.");
        } else if (event.event_type === "checkout.closed") {
          setIsLoading(false);
        }
      },
    });
  }, []);

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Please sign in to upgrade");
      router.push("/sign-in");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID || "pdt_0Np0uOEX0S3ENoriL45Hf",
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
      console.error("Checkout error:", error);
      const message = error instanceof Error ? error.message : "Failed to start checkout. Please try again.";
      toast.error(message);
      setIsLoading(false);
    }
  };
  return (
    <section
      id="pricing"
      className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 max-w-5xl"
    >
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-slate-900">
          Simple pricing
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          Start free, upgrade when you need more
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
        {/* Free Tier */}
        <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all">
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-900">
              Free
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-bold text-slate-900">
                $0
              </span>
              <span className="text-slate-600 text-xs sm:text-sm">forever</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-2.5 mb-6 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-lg transition-colors text-xs sm:text-sm"
          >
            Get started
          </button>

          <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
            <li className="flex items-center gap-2 text-slate-700">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 flex-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>5 credits only</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 flex-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Up to 20 notes</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 flex-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {/* <span>Basic search</span> */}
            </li>
            <li className="flex items-center gap-2 text-slate-700">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 flex-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {/* <span>Community support</span> */}
            </li>
          </ul>
        </div>

        <div className="group relative p-6 sm:p-8 bg-amber-50 border border-black/5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute -top-2.5 sm:-top-3 right-4 px-2 sm:px-2.5 py-0.5 bg-[#D4AF37] text-black text-[9px] sm:text-[10px] font-semibold rounded-full tracking-wide">
            POPULAR
          </div>

          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-black">
              Pro
            </h3>
            <div className="flex items-end gap-1">
              <span className="text-3xl sm:text-4xl font-bold text-black">
                <ShinyText
                  text="20$"
                  disabled={false}
                  speed={3}
                  className="custom-class"
                />
              </span>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full py-2.5 mb-6 sm:mb-8 bg-slate-900 text-white hover:bg-black font-medium rounded-lg transition-all text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating checkout..." : "Upgrade now"}
          </button>

          <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
            {["Unlimited credits", "Unlimited notes", "Priority support"].map(
              (item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-neutral-700"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] flex-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{item}</span>
                </li>
              ),
            )}
          </ul>

          {/* Subtle Hover Glow */}
          <div className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl bg-[#D4AF37]/10"></div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
