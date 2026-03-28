import { getExportDownloadUrl } from "./shapediver-backend.js";

const url = await getExportDownloadUrl({
    platform: {
        baseUrl: "https://app.shapediver.com",
        clientId: "827bcbdc-8a5c-481a-b09a-e498074d91ca",
        accessKeyId: process.env.SD_ACCESS_KEY_ID,
        accessKeySecret: process.env.SD_ACCESS_KEY_SECRET
    },
    modelIdentifier: "your-model-id-or-slug",
    exportId: "your-export-id",
    parameters: {
        // parameterId: value
    }
});

console.log("Download URL:", url);