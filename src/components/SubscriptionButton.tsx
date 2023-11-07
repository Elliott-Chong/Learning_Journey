"use client";
import React from "react";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import axios from "axios";

type Props = {
  isPro: boolean;
};

const SubscriptionButton = ({ isPro }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const onClick = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (error) {
      console.log("billing error", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button className="mt-4" disabled={loading} onClick={onClick}>
      {isPro ? "Manage Subscriptions" : "Upgrade"}
      {!isPro && <Zap className="ml-1 fill-white" />}
    </Button>
  );
};

export default SubscriptionButton;
