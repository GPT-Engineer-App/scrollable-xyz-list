import React from "react";
import { cn } from "@/lib/utils";

export const Loader = ({ className, ...props }) => {
  return (
    <div className={cn("animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900", className)} {...props}></div>
  );
};