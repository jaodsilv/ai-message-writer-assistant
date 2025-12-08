import { PassThrough } from "stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";
import type { EntryContext } from "react-router";
import isbot from "isbot";

const ABORT_DELAY = 5000;

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext
) {
    return new Promise((resolve, reject) => {
        let shellRendered = false;
        const userAgent = request.headers.get("user-agent");

        const { pipe, abort } = renderToPipeableStream(
            <ServerRouter context={routerContext} url={request.url} />,
            {
                onShellReady() {
                    shellRendered = true;
                    const body = new PassThrough();
                    const stream = createReadableStreamFromReadable(body);

                    responseHeaders.set("Content-Type", "text/html");

                    resolve(
                        new Response(stream, {
                            headers: responseHeaders,
                            status: responseStatusCode,
                        })
                    );

                    pipe(body);
                },
                onShellError(error: unknown) {
                    reject(error);
                },
                onError(error: unknown) {
                    responseStatusCode = 500;
                    // Log streaming rendering errors from inside the shell.  Don't log
                    // errors encountered during initial shell rendering since they'll
                    // reject and get logged in handleDocumentRequest.
                    if (shellRendered) {
                        console.error(error);
                    }
                },
            }
        );

        setTimeout(abort, ABORT_DELAY);
    });
}
