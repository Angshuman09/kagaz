"use client";
import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { Button } from "@/components/ui/button";
import LoadingPage from "@/components/loading";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";

const CheckoutPage = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const userUpgradePlan = useMutation(api.user.upgradeUser);
  const user = useUser();

  useEffect(() => {
    fetch("/api/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    }

    const result = await userUpgradePlan({
      userEmail: user?.primaryEmailAddress?.emailAddress as string,
    })

    setLoading(false);
  };

  if (!clientSecret || !stripe || !elements) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="w-full border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-3">
            Complete Your Payment
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Secure checkout powered by Stripe. Your payment information is encrypted and protected.
          </p>
        </div>
      </div>

      {/* Payment Form Section */}
      <div className="w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <form action="" onSubmit={handleSubmit} className="space-y-8">
            {/* Amount Display */}
            <div className="bg-black text-white p-6 md:p-8">
              <div className="flex items-baseline justify-between flex-wrap gap-4">
                <span className="text-sm md:text-base font-medium uppercase tracking-wide" style={{ color: '#D4AF37' }}>
                  Total Amount
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl lg:text-6xl font-bold">
                    ${amount}
                  </span>
                  <span className="text-lg md:text-xl text-gray-400">USD</span>
                </div>
              </div>
            </div>

            {/* Payment Element */}
            {clientSecret && (
              <div className="space-y-4">
                <label className="block text-base md:text-lg font-semibold text-black">
                  Payment Details
                </label>
                <div className="payment-element-wrapper">
                  <PaymentElement />
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-red-500 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm md:text-base text-red-800 font-medium">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              disabled={!stripe || loading}
              className="w-full cursor-pointer h-14 md:h-16 text-base md:text-lg font-semibold text-white bg-black hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              style={{ backgroundColor: !stripe || loading ? '#000' : '#000' }}
            >
              <span className="flex items-center justify-center gap-3">
                {!loading ? (
                  <>
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Pay ${amount}
                  </>
                ) : (
                  <>
                    <svg
                      className="animate-spin w-5 h-5 md:w-6 md:h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                )}
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;