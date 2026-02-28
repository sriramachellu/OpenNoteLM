"use client";

import { Box, Typography, Button, Container, Grid, Paper, Stack, AppBar, Toolbar, useTheme } from "@mui/material";
import { CloudUpload, Bolt, Storage, Search, Security, GitHub } from "@mui/icons-material";
import Link from "next/link";
import { motion } from "framer-motion";

const Feature = ({ icon: Icon, title, description }: any) => {
  const theme = useTheme() as any;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        bgcolor: 'background.paper',
        height: '100%',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          bgcolor: theme.palette.surfaceVariant || '#E7E0EC',
          borderColor: 'primary.main',
        }
      }}
    >
      <Box sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        bgcolor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'primary.contrastText',
        mb: 2.5
      }}>
        <Icon sx={{ fontSize: 24 }} />
      </Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{description}</Typography>
    </Paper>
  );
};

export default function Landing() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0 }, height: 64 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5, color: 'text.primary' }}>
              OpenNoteLM
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button component={Link} href="/app" variant="contained" color="primary" sx={{ textTransform: 'none', borderRadius: 10, px: 3, fontWeight: 600 }}>Open App</Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 15 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2.5rem', md: '3.75rem' }, letterSpacing: -1.5 }}>
                Your AI <Box component="span" sx={{ color: 'primary.main' }}>notebook.</Box>
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 4, fontWeight: 400, lineHeight: 1.4 }}>
                An ephemeral, privacy-first alternative to Google's NotebookLM. Drop your PDFs into a zero-retention workspace powered by Hybrid RAG. Your data is destroyed when you leave.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={Link} href="/app" variant="contained" size="large" sx={{ py: 2, px: 4, fontSize: '1.1rem', borderRadius: 10, textTransform: 'none', fontWeight: 600 }}>
                  Get Started Free
                </Button>
                <Button component={Link} href="/tech" variant="outlined" size="large" sx={{ py: 2, px: 4, fontSize: '1.1rem', borderRadius: 10, textTransform: 'none', fontWeight: 600 }}>
                  Architecture
                </Button>
              </Stack>
              <Stack direction="row" spacing={4} sx={{ mt: 6 }}>
                <Box>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>~120ms</Typography>
                  <Typography variant="caption" color="text.secondary">Inference Latency</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>1M+</Typography>
                  <Typography variant="caption" color="text.secondary">Context Window</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>768-D</Typography>
                  <Typography variant="caption" color="text.secondary">Vector Search</Typography>
                </Box>
              </Stack>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{
              p: 1.5,
              bgcolor: 'background.paper',
              borderRadius: 6,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 48,
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                px: 2,
                gap: 1.2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                zIndex: 1, // Ensure dots stay above the image border pt
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}>
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ff5f56', border: '1px solid #e0443e' }} />
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ffbd2e', border: '1px solid #dea123' }} />
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#27c93f', border: '1px solid #1aab29' }} />
              </Box>
              <Box component="img"
                src={theme.palette.mode === 'dark' ? '/light_theme.png' : '/dark_theme.png'}
                alt="OpenNoteLM Notebook View"
                sx={{
                  width: '100%',
                  borderRadius: 4,
                  pt: 4,
                  transition: '0.3s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 20 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 800, letterSpacing: -0.5 }}>Built for the Modern Web</Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}>
            A powerful, private RAG pipeline that puts you in control of your data and your AI.
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Feature icon={Bolt} title="Gemini 2.5 Flash" description="Fast inference with ~120ms latency and deep document reasoning." />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Feature icon={Storage} title="Real time Convex" description="Serverless architecture scales to zero and ensures fast vector search and secure storage." />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Feature icon={Search} title="Hybrid Search" description="Combines 768-D Vector Search with exact BM25 Lexical text indexing for perfect multi-source retrieval." />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Feature icon={Security} title="Ephemeral By Design" description="Strict session isolation with zero long-term retention. Close the tab and your data ceases to exist." />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Feature icon={CloudUpload} title="Markdown Intelligence" description="Clean text extraction from PDFs using advanced parsing, generating quizzes, flashcards, and mind maps." />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Feature icon={Storage} title="Full Control" description="Built with a modular Next.js App Router architecture ready for deployment and scaling." />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 20, textAlign: 'center', py: 12, bgcolor: 'background.paper', borderRadius: 8, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, letterSpacing: -1 }}>Get started with OpenNoteLM</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>Join the premier open-source platform for ephemeral document intelligence. Ideal for rapid, private sandbox research.</Typography>
          <Button component={Link} href="/app" variant="contained" size="large" sx={{ py: 2, px: 6, fontSize: '1.2rem', borderRadius: 10, textTransform: 'none', fontWeight: 600 }}>
            Open Application
          </Button>
        </Box>
      </Container>

      <Box component="footer" sx={{ py: 8, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center', mt: 8 }}>
        <Typography variant="body2" color="text.secondary">
          © 2026 OpenNoteLM. All rights reserved. <br />
          Built with Gemini 2.5 Flash & Convex.
        </Typography>
      </Box>
    </Box>
  );
}

