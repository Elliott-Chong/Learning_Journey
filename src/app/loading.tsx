import { Loader2 } from "lucide-react";
import React from "react";

type Props = {};

const Loading = (props: Props) => {
  return (
    <div className="absolute-center">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );
};

export default Loading;
