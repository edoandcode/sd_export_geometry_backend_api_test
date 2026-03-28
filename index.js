import dotenv from "dotenv";
import { getExportDownloadUrl } from "./shapediver-backend.js";

dotenv.config();

const requiredEnvVars = [
    "SD_ACCESS_KEY_ID",
    "SD_ACCESS_KEY_SECRET",
    "SD_MODEL_IDENTIFIER",
    "SD_EXPORT_ID"
];

const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]?.trim());

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
    process.exit(1);
}



async function main() {
    console.log("Starting export...");

    const downloadUrl = await getExportDownloadUrl({
        platform: {
            accessKeyId: process.env.SD_ACCESS_KEY_ID,
            accessKeySecret: process.env.SD_ACCESS_KEY_SECRET
        },
        modelIdentifier: process.env.SD_MODEL_IDENTIFIER,
        exportId: process.env.SD_EXPORT_ID,
        parameters: {
            "05d9367a-20ec-4ed9-acbd-1031a703bfa4": "3.25",
            "50a8e515-8217-4fb1-9e7c-598a09380272": "1",
            "cfefdf68-ca86-47c1-963a-2c71fea7ba94": "57",
            "c2911612-57fd-43f5-892a-d6f5a78cada2": "2.50",
            "9d37c5fd-d488-43be-a422-4c758f4b1f65": "0",
            "8b6be7b3-34b8-41a4-ba34-d7baedf42a05": "0",
            "4dcd6c2a-9fc2-40fc-8b0e-83577677a58d": "0",
            "d1f2312f-e711-488c-9dbd-bd7d5e3fbc37": "7.00",
            "fa5dca6c-4f19-45c7-a283-a641757c4219": "Default",
            "f62bc015-b7f4-457b-82e9-2a18703297f8": "Refe",
            "069ebca0-4c53-4634-b0e2-98d3cb3008b2": "10.00",
            "faf12329-e726-4fa9-bfaa-3a9d95f7c619": "6",
            "4ec111aa-0840-4b5e-a2a0-903997b701f7": "File_name",
            "b34ae561-4c7e-4a79-9ec0-d6ea3a62b41b": "1.60",
            "72969bee-640d-4f37-805e-b032b6b0fcb7": "0",
            "402a2a39-13b5-480d-aae2-dfb23c88a7d3": "0",
            "f31c761d-944f-4175-8e63-f95f6b19ca1a": "NAME"
        }
    });

    console.log("Export completed");
    console.log(`Download URL: ${downloadUrl}`);

    console.log("Downloading immediately...");
    const res = await fetch(downloadUrl);
    console.log(res.status);
}

try {
    await main();
} catch (error) {
    console.error("Failed to get export download URL.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}
