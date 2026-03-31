import express from "express";
import dotenv from "dotenv";
import { exportFile } from "./shapediver.service.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// POST /api/export
app.post("/api/export", async (req, res) => {
    try {
        const { modelId, downloadType, parameters = {} } = req.body;

        // Validate input
        if (!modelId || typeof modelId !== "string") {
            return res.status(400).json({ error: "modelId is required and must be a string" });
        }

        if (!downloadType || typeof downloadType !== "string") {
            return res.status(400).json({ error: "downloadType is required and must be a string" });
        }

        console.log(`[Export API] Starting export for model: ${modelId}, type: ${downloadType}`);

        const downloadUrl = await exportFile({
            modelId,
            downloadType,
            parameters
        });

        console.log(`[Export API] Export completed successfully`);

        res.json({ downloadUrl });
    } catch (error) {
        console.error(`[Export API] Error:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
