export const runtime = "edge";
export const preferredRegion = ["iad1"];

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server";
import { createContext } from "@/server/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    // @ts-ignore
    createContext,
  });

export { handler as GET, handler as POST };
