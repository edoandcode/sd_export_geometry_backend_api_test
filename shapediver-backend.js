// shapediver-backend.js
import {
    create as createPlatformSdk,
    SdPlatformModelGetEmbeddableFields,
    SdPlatformModelTokenScopes
} from "@shapediver/sdk.platform-api-sdk-v1";
import { Configuration, SessionApi, UtilsApi } from "@shapediver/sdk.geometry-api-sdk-v2";

export async function authenticatePlatform({
    baseUrl = "https://app.shapediver.com",
    clientId = "827bcbdc-8a5c-481a-b09a-e498074d91ca",
    accessKeyId,
    accessKeySecret
}) {
    const sdk = createPlatformSdk({ baseUrl, clientId });
    await sdk.authorization.passwordGrant(accessKeyId, accessKeySecret);
    const token = sdk.authorization?.__context?.__accessTokenDetails?.access_token;

    if (!token) {
        throw new Error("Authentication failed: no access token");
    }
    return sdk;
}

export async function createSession({
    sdk,
    modelIdentifier, // model id, guid, or slug
    allowExports = true
}) {
    const model = (
        await sdk.models.get(modelIdentifier, [SdPlatformModelGetEmbeddableFields.BackendTicket])
    ).data;

    const scopes = allowExports
        ? [SdPlatformModelTokenScopes.GroupView, SdPlatformModelTokenScopes.GroupExport]
        : [SdPlatformModelTokenScopes.GroupView];

    const token = (await sdk.modelTokens.create({ id: modelIdentifier, scope: scopes })).data;

    const config = new Configuration({
        basePath: token.model_view_url,
        accessToken: token.access_token
    });

    const session = (await new SessionApi(config).createSessionByTicket(model.backend_ticket.ticket))
        .data;

    console.log("Available exports:", session.exports);

    return {
        config,
        sessionId: session.sessionId,
        exports: session.exports // map of available exports
    };
}

export async function runExport({
    config,
    sessionId,
    exportId,
    parameters = {},
    maxWaitMsec = 20000
}) {
    const result = await new UtilsApi(config).submitAndWaitForExport(
        sessionId,
        { parameters, exports: [exportId] },
        maxWaitMsec
    );

    const exp = result.exports[exportId];
    if (!exp) throw new Error("Export not found in result");
    if (exp.status_computation !== "success") {
        throw new Error("Export computation failed: " + exp.status_computation);
    }
    if (exp.status_collect !== "success") {
        throw new Error("Export collect failed: " + exp.status_collect);
    }
    if (!exp.content?.length || !exp.content[0].href) {
        throw new Error("Export did not return a downloadable file URL");
    }

    return exp.content[0].href; // download URL
}

export async function closeSession({ config, sessionId }) {
    await new SessionApi(config).closeSession(sessionId);
}

// Convenience function: auth -> session -> export -> URL
export async function getExportDownloadUrl({
    platform,
    modelIdentifier,
    exportId,
    parameters = {}
}) {
    const sdk = await authenticatePlatform(platform);
    const { config, sessionId } = await createSession({ sdk, modelIdentifier, allowExports: true });

    try {
        return await runExport({ config, sessionId, exportId, parameters });
    } finally {
        // await closeSession({ config, sessionId });
    }
}