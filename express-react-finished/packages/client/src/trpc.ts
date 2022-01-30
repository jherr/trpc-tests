import { createReactQueryHooks } from "@trpc/react";
import type { AppRouter } from "api";

export const trpc = createReactQueryHooks<AppRouter>();
