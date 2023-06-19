import type { SSRManifest } from "astro";
import { NodeApp } from "astro/app/node";
import { polyfill } from "@astrojs/webapi";

polyfill(globalThis, {
  exclude: "window document",
});

export function createExports(manifest: SSRManifest) {
  const app = new NodeApp(manifest);

  return {
    async render(
      event: any
    ): Promise<any> {
      const {
        body,
        headers,
        rawPath,
        rawQueryString,
        requestContext,
        isBase64Encoded,
      } = event;

      // Convert API Gateway request to Node request
      const scheme = headers["x-forwarded-protocol"] || "https";
      const host = headers["x-forwarded-host"] || headers.host;
      const qs = rawQueryString.length > 0 ? `?${rawQueryString}` : "";
      const url = new URL(`${rawPath}${qs}`, `${scheme}://${host}`);
      const encoding = isBase64Encoded ? "base64" : "utf8";
      const request = new Request(url.toString(), {
        method: requestContext.http.method,
        headers: new Headers(headers as any),
        body: typeof body === "string" ? Buffer.from(body, encoding) : body,
      });

      // Process request
      const rendered = await app.render(request);

      // Convert Node response to API Gateway response
      const contentType = rendered.headers.get("content-type");
      return {
        statusCode: rendered.status,
        headers: Object.fromEntries(rendered.headers.entries()),
        cookies: Array.from(app.setCookieHeaders(rendered)),
        body: await rendered.text(),
      };
    },
  };
}