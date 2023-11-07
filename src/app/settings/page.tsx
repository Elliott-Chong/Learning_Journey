import SubscriptionButton from "@/components/SubscriptionButton";
import { checkSubscription } from "@/lib/subscription";
import React from "react";

type Props = {};

const SettingsPage = async (props: Props) => {
  const isPro = await checkSubscription();
  return (
    <div className="py-8 mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold">Settings</h1>
      {isPro ? (
        <p>
          <p className="text-xl text-secondary-foreground/60">
            You are a Pro user
          </p>
        </p>
      ) : (
        <p>
          <p className="text-xl text-secondary-foreground/60">
            You are a Free user
          </p>
        </p>
      )}
      <SubscriptionButton isPro={isPro} />
    </div>
  );
};

export default SettingsPage;
