"use client";

import { Box, Typography, CircularProgress, Stack, Paper } from "@mui/material";

export default function StudioGenerationZone({ tool }: { tool: string }) {
    const descriptions: Record<string, string> = {
        'Flashcards': 'Crafting study material with questions and detailed answers...',
        'Quiz': 'Designing a challenging assessment to test your understanding...',
        'Mind Map': 'Synthesizing key concepts into a structured hierarchical outline...'
    };

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            textAlign: 'center'
        }}>
            <Paper elevation={0} sx={{
                p: 6,
                borderRadius: 8,
                border: '1px solid',
                borderColor: 'divider',
                maxWidth: 400,
                width: '100%',
                bgcolor: 'background.paper'
            }}>
                <CircularProgress size={48} thickness={4} sx={{ mb: 4, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: -0.5 }}>
                    {tool}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                    {descriptions[tool] || 'Generating structured content from your sources...'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.2, animation: 'pulse 1.5s infinite 0.1s' }} />
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.2, animation: 'pulse 1.5s infinite 0.3s' }} />
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.2, animation: 'pulse 1.5s infinite 0.5s' }} />
                </Box>
            </Paper>

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.5); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 0.2; }
                }
            `}</style>
        </Box>
    );
}
