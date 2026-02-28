"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Box, CircularProgress, Typography, IconButton, Stack, Button, Chip, Avatar, Divider, useTheme, Menu, MenuItem, useMediaQuery, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { ArrowBack, Settings, DarkMode, LightMode, AddCircleOutline, Description, Chat, AutoAwesome } from "@mui/icons-material";
import SourcesPanel from "../../../../components/SourcesPanel";
import ChatContainer from "../../../../components/ChatContainer";
import StudioPanel from "../../../../components/StudioPanel";
import UploadZone from "../../../../components/UploadZone";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { getExistingSessionId, clearSessionId } from "../../../../lib/session";
import { useColorMode } from "../../../../components/ThemeRegistry";

export default function NotebookPage() {
    const params = useParams();
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { toggleColorMode } = useColorMode();
    const notebookId = params.id as any;
    const [mounted, setMounted] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [mobileTab, setMobileTab] = useState(1); // Default to Chat on mobile

    const notebook = useQuery(api.queries.getNotebook, { notebookId });
    const documents = useQuery(api.queries.getDocuments, { notebookId });
    const sessionId_ = getExistingSessionId(); // Check sessionStorage (no auto-create)
    const session = useQuery(api.queries.getSession, sessionId_ ? { sessionId: sessionId_ } : "skip");

    const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
    const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
    const [isIngestionOpen, setIsIngestionOpen] = useState(false);
    const wipeData = useMutation(api.mutations.wipeAllData);
    const createSession = useMutation(api.mutations.createSession);

    const [avatarAnchorEl, setAvatarAnchorEl] = useState<null | HTMLElement>(null);

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAvatarAnchorEl(event.currentTarget);
    };

    const handleAvatarClose = () => {
        setAvatarAnchorEl(null);
    };

    const handleResetSession = async () => {
        if (window.confirm("Are you sure you want to completely reset this session and delete all data from the cloud? This cannot be undone.")) {
            if (sessionId) {
                await wipeData({ sessionId });
                clearSessionId();
                window.location.href = '/app';
            }
        }
        handleAvatarClose();
    };

    useEffect(() => {
        setMounted(true);
        if (!sessionId_) {
            // No session in sessionStorage — redirect to entry page
            router.push('/app');
            return;
        }
        setSessionId(sessionId_);
        // Ensure the session record exists in Convex (idempotent)
        createSession({ sessionId: sessionId_ });
    }, [sessionId_, router, createSession]);

    // Cleanup on tab close / refresh
    useEffect(() => {
        const handleBeforeUnload = () => {
            const currentSessionId = sessionId_ || sessionId;
            if (currentSessionId) {
                navigator.sendBeacon(
                    "/api/cleanup",
                    new Blob(
                        [JSON.stringify({ sessionId: currentSessionId })],
                        { type: "application/json" }
                    )
                );
                clearSessionId();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [sessionId_, sessionId]);

    const chatRef = useRef<any>(null);

    if (!mounted || !notebook || !sessionId) {
        return (
            <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default' }}>
                <CircularProgress />
            </Box>
        );
    }

    const userInitial = session?.userName ? session.userName.charAt(0).toUpperCase() : "G";

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', bgcolor: 'background.default', color: 'text.primary' }}>
            {/* Top M3 App Bar */}
            <Box sx={{
                height: isMobile ? 56 : 64,
                px: isMobile ? 1 : 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
                flexShrink: 0
            }}>
                <Stack direction="row" spacing={isMobile ? 1 : 2} alignItems="center">
                    <IconButton size="small" onClick={() => router.push('/app')}><ArrowBack /></IconButton>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant={isMobile ? "subtitle1" : "h6"} noWrap sx={{ fontWeight: 600, maxWidth: isMobile ? 120 : 'none', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {notebook.title}
                        </Typography>
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={isMobile ? 0.5 : 1.5} alignItems="center">
                    {!isMobile && (
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<AddCircleOutline />}
                            onClick={() => router.push('/app')}
                            sx={{
                                borderRadius: 10,
                                textTransform: 'none',
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': { bgcolor: 'primary.main', opacity: 0.9 }
                            }}
                        >
                            Create notebook
                        </Button>
                    )}
                    {isMobile && (
                        <IconButton size="small" onClick={() => router.push('/app')} sx={{ color: 'primary.main' }}>
                            <AddCircleOutline />
                        </IconButton>
                    )}
                    <IconButton size="small" onClick={() => router.push('/app/settings')}><Settings /></IconButton>
                    <IconButton size="small" onClick={toggleColorMode}>
                        {theme.palette.mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                    </IconButton>
                    <IconButton onClick={handleAvatarClick} size="small" sx={{ p: 0 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem', fontWeight: 700 }}>
                            {userInitial}
                        </Avatar>
                    </IconButton>
                </Stack>
            </Box>

            <Menu
                anchorEl={avatarAnchorEl}
                open={Boolean(avatarAnchorEl)}
                onClose={handleAvatarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        mt: 2.5,
                        borderRadius: 2,
                        minWidth: 200,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }
                }}
            >
                <MenuItem onClick={handleResetSession} sx={{ color: 'error.main', fontWeight: 500 }}>Reset Session & Delete Data</MenuItem>
            </Menu>

            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                    {/* Left Column: Sources (22%) */}
                    {(!isMobile || mobileTab === 0) && (
                        <Box sx={{
                            width: isMobile ? '100%' : '22%',
                            height: '100%',
                            flexShrink: 0,
                            borderRight: isMobile ? 0 : 1,
                            borderColor: 'divider'
                        }}>
                            <SourcesPanel
                                documents={documents}
                                notebookId={notebookId}
                                sessionId={sessionId}
                                activeDocumentId={activeDocumentId}
                                setActiveDocumentId={setActiveDocumentId}
                                selectedSourceIds={selectedSourceIds}
                                setSelectedSourceIds={setSelectedSourceIds}
                                onAddSource={() => setIsIngestionOpen(true)}
                            />
                        </Box>
                    )}

                    {/* Center Column: Chat (53%) */}
                    {(!isMobile || mobileTab === 1) && (
                        <Box sx={{
                            width: isMobile ? '100%' : '53%',
                            height: '100%',
                            flexGrow: 1
                        }}>
                            <ChatContainer
                                ref={chatRef}
                                sessionId={sessionId}
                                notebookId={notebookId}
                                activeDocumentId={activeDocumentId}
                                selectedSourceIds={selectedSourceIds}
                            />
                        </Box>
                    )}

                    {/* Right Column: Studio (25%) */}
                    {(!isMobile || mobileTab === 2) && (
                        <Box sx={{
                            width: isMobile ? '100%' : '25%',
                            height: '100%',
                            flexShrink: 0,
                            borderLeft: isMobile ? 0 : 1,
                            borderColor: 'divider'
                        }}>
                            <StudioPanel
                                notebookId={notebookId}
                                sessionId={sessionId}
                                selectedSourceIds={selectedSourceIds}
                            />
                        </Box>
                    )}
                </Box>

                {/* Mobile Navigation */}
                {isMobile && (
                    <BottomNavigation
                        showLabels
                        value={mobileTab}
                        onChange={(event, newValue) => setMobileTab(newValue)}
                        sx={{ borderTop: 1, borderColor: 'divider', height: 64, flexShrink: 0 }}
                    >
                        <BottomNavigationAction label="Sources" icon={<Description />} />
                        <BottomNavigationAction label="Chat" icon={<Chat />} />
                        <BottomNavigationAction label="Studio" icon={<AutoAwesome />} />
                    </BottomNavigation>
                )}
            </Box>

            {/* Ingestion Dialog */}
            <Dialog
                open={isIngestionOpen}
                onClose={() => setIsIngestionOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, bgcolor: 'background.paper' }
                }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>Add sources</DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ height: 400 }}>
                        <UploadZone
                            sessionId={sessionId}
                            notebookId={notebookId}
                            onComplete={() => setIsIngestionOpen(false)}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}

function Add() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg> }
