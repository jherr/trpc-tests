import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { wsLink, createWSClient } from "@trpc/client/links/wsLink";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { withTRPC } from "@trpc/next";
import { AppType } from "next/dist/shared/lib/utils";
import superjson from "superjson";
import getConfig from "next/config";

import type { AppRouter } from "server/routers/_app";

const { publicRuntimeConfig } = getConfig();

import "../styles/globals.css";

const { APP_URL, WS_URL } = publicRuntimeConfig;

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

function getEndingLink() {
  if (!process.browser) {
    return httpBatchLink({
      url: `${APP_URL}/api/trpc`,
    });
  }
  const client = createWSClient({
    url: WS_URL,
  });
  return wsLink<AppRouter>({
    client,
  });
}

export default withTRPC<AppRouter>({
  config({ ctx }) {
    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            (process.env.NODE_ENV === "development" && process.browser) ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        getEndingLink(),
      ],
      transformer: superjson,
      queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
      headers: () => {
        if (ctx?.req) {
          return {
            ...ctx.req.headers,
            "x-ssr": "1",
          };
        }
        return {};
      },
    };
  },
  ssr: true,
})(MyApp);
