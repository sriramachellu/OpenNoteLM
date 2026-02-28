"use client";

import { Box, Typography, IconButton, Paper, CircularProgress, Stack } from "@mui/material";
import { Close, Download } from "@mui/icons-material";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function SourcePreview({ document, onClose }: { document: any, onClose: () => void }) {
    const fileUrl = useQuery(api.queries.getFileUrl, document?.storageId ? { storageId: document.storageId } : "skip" as any);

    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1400,
            bgcolor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 1, md: 4 }
        }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                color: 'white'
            }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{document?.filename}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>{document?.pageCount} pages • PDF Source</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    {fileUrl && (
                        <IconButton
                            component="a"
                            href={fileUrl as string}
                            target="_blank"
                            download
                            sx={{ color: 'white' }}
                        >
                            <Download />
                        </IconButton>
                    )}
                    <IconButton onClick={onClose} sx={{ color: 'white' }}>
                        <Close />
                    </IconButton>
                </Stack>
            </Box>

            {/* Viewer */}
            <Paper elevation={0} sx={{
                flexGrow: 1,
                borderRadius: 4,
                overflow: 'hidden',
                bgcolor: 'background.paper',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
            }}>
                {fileUrl === undefined ? (
                    <CircularProgress />
                ) : !fileUrl ? (
                    <Typography color="error">Failed to load preview</Typography>
                ) : (
                    <iframe
                        src={`${fileUrl}#toolbar=0`}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        title="Source Preview"
                    />
                )}
            </Paper>
        </Box>
    );
}
