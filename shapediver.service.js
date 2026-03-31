import {
    authenticatePlatform,
    createSession,
    runExport,
} from "./shapediver-backend.js";

const EXPORT_TYPE_MAP = {
    "Download file 3D": null,        // Will be populated from session.exports
    "Download technical drawing": null
};

export async function exportFile({ modelId, downloadType, parameters = {} }) {
    // Validate downloadType
    if (!EXPORT_TYPE_MAP.hasOwnProperty(downloadType)) {
        throw new Error(`Unknown downloadType: ${downloadType}. Supported types: ${Object.keys(EXPORT_TYPE_MAP).join(", ")}`);
    }

    // Authenticate
    console.log("[ExportService] Authenticating...");
    const sdk = await authenticatePlatform({
        baseUrl: process.env.SD_BASE_URL || "https://app.shapediver.com",
        clientId: process.env.SD_CLIENT_ID || "827bcbdc-8a5c-481a-b09a-e498074d91ca",
        accessKeyId: process.env.SD_ACCESS_KEY_ID,
        accessKeySecret: process.env.SD_ACCESS_KEY_SECRET
    });

    // Create session
    console.log("[ExportService] Creating session...");
    const { config, sessionId, exports } = await createSession({
        sdk,
        modelIdentifier: modelId,
        allowExports: true
    });

    // Find exportId by downloadType
    console.log("[ExportService] Looking up export type...");
    let exportId = null;
    for (const [id, exp] of Object.entries(exports)) {
        if (exp.name === downloadType) {
            exportId = id;
            break;
        }
    }

    if (!exportId) {
        const availableTypes = Object.values(exports)
            .map(exp => exp.name)
            .join(", ");
        throw new Error(`Export type "${downloadType}" not found. Available: ${availableTypes}`);
    }

    console.log(`[ExportService] Export found: ${exportId}`);

    // Run export
    console.log("[ExportService] Running export...");
    const downloadUrl = await runExport({
        config,
        sessionId,
        exportId,
        parameters
    });

    console.log("[ExportService] Export completed");

    return downloadUrl;
}
