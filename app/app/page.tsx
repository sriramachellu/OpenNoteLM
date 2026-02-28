"use client";

import { useEffect, useState } from "react";
import { createNewSessionId, getExistingSessionId, clearSessionId } from "../../lib/session";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Box, CircularProgress, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Typography } from "@mui/material";
import Dashboard from "../../components/Dashboard";

export default function App() {
    const [mounted, setMounted] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
    const [tempName, setTempName] = useState("");

    const createSession = useMutation(api.mutations.createSession);
    const updateSessionName = useMutation(api.mutations.updateSessionName);
    const session = useQuery(api.queries.getSession, sessionId ? { sessionId } : "skip");

    // On mount: check for existing session or create fresh
    useEffect(() => {
        setMounted(true);
        const existingId = getExistingSessionId();

        if (existingId) {
            // We have a session! Just use it.
            setSessionId(existingId);
            createSession({ sessionId: existingId });
        } else {
            // Brand new visit: create a fresh session
            const newId = createNewSessionId();
            setSessionId(newId);
            createSession({ sessionId: newId });
        }
    }, [createSession]);

    // Handle name dialog
    useEffect(() => {
        if (session && !session.userName && !isNameDialogOpen) {
            setIsNameDialogOpen(true);
        }
    }, [session, isNameDialogOpen]);

    const handleNameSubmit = async () => {
        const name = tempName.trim() || "Guest";
        if (sessionId) {
            await updateSessionName({ sessionId, userName: name });
            setIsNameDialogOpen(false);
        }
    };

    // Cleanup on tab close / refresh: use sendBeacon to wipe Convex data
    useEffect(() => {
        const handleBeforeUnload = () => {
            const currentSessionId = getExistingSessionId();
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
    }, []);

    if (!mounted || !sessionId || !session) {
        return (
            <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Dashboard sessionId={sessionId} />

            <Dialog
                open={isNameDialogOpen}
                onClose={() => { }} // Force name entry
                PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 320 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Welcome to OpenNoteLM</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Please enter your name to start this session.
                    </Typography>
                    <TextField
                        fullWidth
                        autoFocus
                        label="Your Name"
                        placeholder="Guest"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleNameSubmit}
                        sx={{ borderRadius: 10, py: 1, fontWeight: 600 }}
                    >
                        Start Session
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
