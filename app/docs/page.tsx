"use client";

import { Box, Container, Typography, Paper, Divider, Stack, Button } from "@mui/material";
import Link from "next/link";

const CodeSnippet = ({ code }: { code: string }) => (
    <Paper sx={{ p: 2, bgcolor: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', mb: 4, overflowX: 'auto' }}>
        <pre style={{ margin: 0 }}>{code}</pre>
    </Paper>
);

export default function Docs() {
    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
            <Container maxWidth="md">
                <Button component={Link} href="/" sx={{ mb: 4 }}>← Back to Home</Button>
                <Typography variant="h2" gutterBottom sx={{ fontWeight: 800 }}>Documentation</Typography>

                <Box sx={{ mt: 6 }}>
                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Quick Start</Typography>
                    <Typography paragraph>Get your own instance of OpenNoteLM running in under 5 minutes.</Typography>

                    <Typography variant="h6" gutterBottom>1. Clone the repository</Typography>
                    <CodeSnippet code="git clone https://github.com/your-username/opennotelm.git\ncd opennotelm" />

                    <Typography variant="h6" gutterBottom>2. Install dependencies</Typography>
                    <CodeSnippet code="npm install" />

                    <Typography variant="h6" gutterBottom>3. Configure Convex</Typography>
                    <CodeSnippet code="npx convex dev" />
                    <Typography variant="body2" color="text.secondary" paragraph>
                        This will initialize your backend and open the Convex dashboard. Add your `GOOGLE_API_KEY` to the Convex Environment Variables.
                    </Typography>

                    <Typography variant="h6" gutterBottom>4. Run locally</Typography>
                    <CodeSnippet code="npm run dev" />
                </Box>

                <Divider sx={{ my: 10 }} />

                <Box>
                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Architecture & Tech Stack</Typography>
                    <Typography paragraph>OpenNoteLM is built for extreme speed and privacy, utilizing a modern serverless stack.</Typography>

                    <Stack spacing={4}>
                        <Paper sx={{ p: 4 }}>
                            <Typography variant="h6" gutterBottom>Frontend Framework</Typography>
                            <Typography color="text.secondary">
                                Built on Next.js(App Router, React) with a highly customized Material UI theme. Almost entirely client-side rendered for instant, optimistic UI updates.
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 4 }}>
                            <Typography variant="h6" gutterBottom>Backend & Database</Typography>
                            <Typography color="text.secondary">
                                Powered by Convex (v1.32.0). Serverless architecture providing real-time database syncing, background actions, and built-in vector search capabilities.
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 4 }}>
                            <Typography variant="h6" gutterBottom>AI Models</Typography>
                            <Typography color="text.secondary">
                                Relying on Google's Gemini 2.5 Flash for extremely low latency streaming (~120ms Time to First Token) and Google text-embedding-004 for 768-dimensional vector embeddings.
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 4 }}>
                            <Typography variant="h6" gutterBottom>Data Processing Pipeline</Typography>
                            <Typography color="text.secondary">
                                PDFs (Max 4MB) are parsed via Python (pymupdf4llm), chunked & hashed (SHA-256 deduplication), and stored ephemerally in Convex. RAG queries are evaluated using a joint BM25 + Vector Hybrid search algorithm. Once your session ends, all active data is permanently scrubbed.
                            </Typography>
                        </Paper>
                    </Stack>
                </Box>

                <Box sx={{ mt: 10, p: 4, bgcolor: 'rgba(92, 78, 229, 0.1)', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>Need help?</Typography>
                    <Typography paragraph>Open an issue on GitHub or reach out to the community.</Typography>
                    <Button variant="contained">View GitHub Issues</Button>
                </Box>
            </Container>
        </Box>
    );
}
