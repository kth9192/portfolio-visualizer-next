"use client ";

import CustomSpinner from "@/components/spinner/customSpinner";
import { HydrationBoundary } from "@tanstack/react-query";
import { Suspense, type ReactNode } from "react";

interface HydrationWapperProps {
  state: unknown;
  children: ReactNode;
}

export function HydrationWapper({ children, state }: HydrationWapperProps) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}

export default HydrationWapper;
