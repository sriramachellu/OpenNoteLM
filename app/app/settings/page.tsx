"use client";

import { Box, Container, Typography, IconButton, Paper, Stack, Switch, FormControlLabel, Divider, Button, TextField, useTheme } from "@mui/material";
import { ArrowBack, Security, Palette, Language, Notifications, SmartToy } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useColorMode } from "../../../components/ThemeRegistry";
import { getExistingSessionId } from "../../../lib/session";

export default function SettingsPage() {
    const router = useRouter();
    const theme = useTheme();
    const { toggleColorMode } = useColorMode();
    const isDark = theme.palette.mode === 'dark';
    const wipeAllData = useMutation(api.mutations.wipeAllData);

    const handleClearAll = async () => {
        if (window.confirm("This will permanently delete ALL your notebooks, documents, and messages. Are you sure?")) {
            const sessionId = getExistingSessionId();
            if (!sessionId) {
                router.push('/app');
                return;
            }
            await wipeAllData({ sessionId });
            router.push('/app');
        }
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="md">
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>Settings</Typography>
                </Box>

                <Stack spacing={3}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                            <Palette sx={{ mr: 1.5, color: 'primary.main' }} /> Appearance
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={3}>
                            <FormControlLabel
                                control={<Switch checked={isDark} onChange={toggleColorMode} />}
                                label={`Theme: ${isDark ? 'Dark' : 'Light'}`}
                            />
                        </Stack>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                            <Security sx={{ mr: 1.5, color: 'primary.main' }} /> Privacy & Data
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                            Your documents are stored securely in Convex and indexed via Google AI Studio.
                            We do not share your data with 3rd party training sets.
                        </Typography>
                        <Button variant="outlined" color="error" sx={{ borderRadius: 10, textTransform: 'none', px: 3 }} onClick={handleClearAll}>
                            Delete all data (Reset account)
                        </Button>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
}
