"use client";

import { Box, Typography, Button, Container, Grid, Paper, Stack, AppBar, Toolbar, useTheme } from "@mui/material";
import Link from "next/link";
import { Bolt, Storage, Description, Search, Code } from "@mui/icons-material";

export default function TechStack() {
    const theme = useTheme() as any;

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
            <Container maxWidth="lg">
                <Button component={Link} href="/" variant="text" sx={{ mb: 4, textTransform: 'none', borderRadius: 10 }}>← Back to Home</Button>
                <Typography variant="h2" gutterBottom sx={{ fontWeight: 800, letterSpacing: -1.5 }}>The Tech Stack</Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 8, maxWidth: 800, lineHeight: 1.4 }}>
                    Architecture optimized for speed, RAG accuracy, and developer autonomy. Built for the future of document intelligence.
                </Typography>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{
                            p: 4,
                            height: '100%',
                            border: '1px solid',
                            borderColor: 'primary.main',
                            bgcolor: 'background.paper',
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                bgcolor: 'primary.main'
                            }} />
                            <Typography variant="h4" color="primary" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Bolt sx={{ fontSize: 32 }} /> Gemini 2.5 Flash
                            </Typography>
                            <Typography sx={{ mb: 2, lineHeight: 1.7 }}>
                                We utilize Google's Gemini 2.5 Flash model for lightning-fast inference and deep reasoning. With its massive context window and native multimodal capabilities, it handles complex document analysis with ease.
                            </Typography>
                            <Box sx={{
                                bgcolor: theme.palette.surfaceVariant || '#E7E0EC',
                                p: 2,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>SPECIFICATIONS</Typography>
                                <Typography variant="body2" color="text.primary">
                                    Model: gemini-2.5-flash • Latency: ~120ms • Context: 1M+ tokens
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{
                            p: 4,
                            height: '100%',
                            border: '1px solid',
                            borderColor: 'primary.main',
                            bgcolor: 'background.paper',
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                bgcolor: 'primary.main'
                            }} />
                            <Typography variant="h4" color="primary" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Storage sx={{ fontSize: 32 }} /> Convex
                            </Typography>
                            <Typography sx={{ mb: 2, lineHeight: 1.7 }}>
                                Convex serves as our reactive backend, coordinating real-time data sync and native vector search. It eliminates the need for complex state management, ensuring your document chats are always in sync.
                            </Typography>
                            <Box sx={{
                                bgcolor: theme.palette.surfaceVariant || '#E7E0EC',
                                p: 2,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>INFRASTRUCTURE</Typography>
                                <Typography variant="body2" color="text.primary">
                                    Reactive DB • Native 768-D Vector Search • Edge Computing
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 4, height: '100%', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Description color="primary" /> Ingestion & Deduplication
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                PDFs (Max 4MB) are extracted to Markdown via Python. We use SHA-256 hashing to perform token deduplication on the fly, eliminating redundant Vector API calls while strictly isolating data by session.
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 4, height: '100%', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Search color="primary" /> Hybrid Semantic RAG
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                We blend Google `text-embedding-004` 768-D Vector Search with exact Convex BM25 Lexical indexing. Results are mapped and mathematically merged to guarantee grounded accuracy before streaming to Gemini.
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 4, height: '100%', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Code color="primary" /> Modern Frontend
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                Built with Next.js, React, and a heavily customized Material UI theme. The interface follows the "Studio Panel" design language for a professional and streamlined user experience.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 15, textAlign: 'center', py: 10, bgcolor: 'background.paper', borderRadius: 8, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, letterSpacing: -1 }}>Private. Fast. Powerful.</Typography>
                    <Typography variant="body1" sx={{ maxWidth: 700, mx: 'auto', mb: 5, color: 'text.secondary' }}>
                        OpenNoteLM is designed for security and speed. Your documents are insulated from public training loops, allowing you to build your own private intelligence hub with confidence.
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button component={Link} href="/app" variant="contained" size="large" sx={{ borderRadius: 10, textTransform: 'none', px: 6 }}>Open Application</Button>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
}
