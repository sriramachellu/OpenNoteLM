import { useState } from "react";
import { Box, Typography, Paper, CircularProgress, Button } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export default function UploadZone({ sessionId, notebookId, onComplete }: { sessionId: string, notebookId: string, onComplete?: () => void }) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const saveDocument = useMutation(api.mutations.saveDocument);
    const chunkDocument = useAction(api.actions.chunkDocument.chunkDocument);
    const generateUploadUrl = useMutation(api.mutations.generateUploadUrl);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setError("Please upload a PDF file.");
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            setError("File exceeds 4MB size limit.");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/extract", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Server error" }));
                throw new Error(errorData.error || "Failed to process PDF.");
            }

            const result = await response.json();
            if (!result.ok) throw new Error(result.error);
            if (!result.markdown || result.markdown.trim().length === 0) {
                console.error("DEBUG: Extracted markdown is empty!", result);
                alert("DEBUG - PDF extracted but returned 0 bytes of text. Please check the Developer Console.");
                throw new Error("Extracted PDF returned empty text.");
            }
            console.log(`DEBUG: Extracted ${result.markdown.length} characters of markdown from ${file.name}`);

            // Step 1.5: Upload file to Convex storage
            const postUrl = await generateUploadUrl();
            const storageResult = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await storageResult.json();

            // Atomic Sequence Step 2: Save to Convex
            const documentId = await saveDocument({
                sessionId,
                notebookId: notebookId as any,
                filename: file.name,
                pageCount: 1,
                markdownContent: result.markdown,
                storageId,
            });

            // Atomic Sequence Step 3 & 4: Trigger chunking and embedding action asynchronously
            chunkDocument({
                documentId,
                sessionId,
                markdownContent: result.markdown
            });

            onComplete?.();

        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 6,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                    maxWidth: 500,
                    width: '100%',
                    position: 'relative'
                }}
            >
                <input
                    id="file-upload-input"
                    type="file"
                    accept="application/pdf"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    onChange={handleFileChange}
                    disabled={isUploading}
                />

                {isUploading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress />
                        <Typography>Extracting markdown from PDF...</Typography>
                    </Box>
                ) : (
                    <>
                        <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>Drop your PDF here</Typography>
                        <Typography color="text.secondary" sx={{ mb: 4 }}>
                            PDF only (Max 4MB) · Saved to your session automatically
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => document.getElementById('file-upload-input')?.click()}
                        >
                            Select File
                        </Button>
                        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                    </>
                )}
            </Paper>
        </Box>
    );
}
