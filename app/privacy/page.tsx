"use client";

import { Box, Container, Typography, Paper, Button } from "@mui/material";
import Link from "next/link";

export default function Privacy() {
    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
            <Container maxWidth="md">
                <Button component={Link} href="/" sx={{ mb: 4 }}>← Back to Home</Button>
                <Paper sx={{ p: 6, borderRadius: 4 }}>
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>Privacy Policy</Typography>
                    <Typography variant="subtitle1" color="text.secondary" paragraph>
                        Last Updated: February 2026
                    </Typography>

                    <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>1. Data Collection</Typography>
                    <Typography paragraph>
                        OpenNoteLM is designed to be a self hosted or user managed tool. We do not run a centralized database that stores your personal PDFs or conversation history. If you are using the public demo, your data is stored in your own browser's session and a isolated Convex database deployment.
                    </Typography>

                    <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>2. Document Storage</Typography>
                    <Typography paragraph>
                        When you upload a PDF (Max 4MB), it is processed into Markdown and saved in your Convex database temporarily. Your data exists only for the duration of your session. Once the session ends, all documents, vectors, and chats are cryptographically wiped with zero long-term retention.
                    </Typography>

                    <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>3. API Keys</Typography>
                    <Typography paragraph>
                        API keys are stored only in your Convex environment variables. They are never transmitted to any third party server.
                    </Typography>

                    <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>4. Session Storage</Typography>
                    <Typography paragraph>
                        We use `sessionStorage` to manage your session ID for the duration of your browser tab. Your session ends automatically when you close the tab or browser. On page refresh, you are prompted to continue or start a new session.
                    </Typography>

                    <Typography sx={{ mt: 8, fontStyle: 'italic', color: 'text.secondary' }}>
                        OpenNoteLM is an open source project. You are encouraged to review the source code on GitHub to verify our security and privacy claims.
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}
