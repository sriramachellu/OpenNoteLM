"use client";

import { Box, Typography, Grid, Card, CardActionArea, Button, Container, Stack, Tab, Tabs, MenuItem, Select, IconButton, Menu, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, useTheme, AppBar, Toolbar, Avatar, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";
import { Add, MoreVert, Folder, Settings, Star, StarBorder } from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { clearSessionId } from "../lib/session";

export default function Dashboard({ sessionId }: { sessionId: string }) {
    const router = useRouter();
    const theme = useTheme();
    const [tab, setTab] = useState(1);
    const notebooks = useQuery(api.queries.getNotebooks, { sessionId });
    const session = useQuery(api.queries.getSession, { sessionId });
    const createNotebook = useMutation(api.mutations.createNotebook);
    const renameNotebook = useMutation(api.mutations.renameNotebook);
    const deleteNotebook = useMutation(api.mutations.deleteNotebook);
    const toggleStar = useMutation(api.mutations.toggleStarNotebook);
    const wipeData = useMutation(api.mutations.wipeAllData);

    // Menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedNb, setSelectedNb] = useState<any>(null);
    const [avatarAnchorEl, setAvatarAnchorEl] = useState<null | HTMLElement>(null);

    // Dialog state
    const [isNotebookDialogOpen, setIsNotebookDialogOpen] = useState(false);
    const [notebookDialogMode, setNotebookDialogMode] = useState<'create' | 'rename'>('create');
    const [notebookTitle, setNotebookTitle] = useState("");

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, nb: any) => {
        event.stopPropagation();
        event.preventDefault();
        setAnchorEl(event.currentTarget);
        setSelectedNb(nb);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedNb(null);
    };

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAvatarAnchorEl(event.currentTarget);
    };

    const handleAvatarClose = () => {
        setAvatarAnchorEl(null);
    };

    const handleResetSession = async () => {
        if (window.confirm("Are you sure you want to completely reset this session and delete all data from the cloud? This cannot be undone.")) {
            await wipeData({ sessionId });
            clearSessionId();
            router.push('/app');
        }
        handleAvatarClose();
    };

    const handleOpenCreateDialog = () => {
        setNotebookDialogMode('create');
        setNotebookTitle("Untitled notebook");
        setIsNotebookDialogOpen(true);
    };

    const handleOpenRenameDialog = () => {
        if (!selectedNb) return;
        setNotebookDialogMode('rename');
        setNotebookTitle(selectedNb.title);
        setIsNotebookDialogOpen(true);
        handleMenuClose();
    };

    const handleSaveNotebook = async () => {
        const title = notebookTitle.trim() || (notebookDialogMode === 'create' ? "Untitled notebook" : selectedNb.title);
        if (notebookDialogMode === 'create') {
            const id = await createNotebook({ sessionId, title });
            router.push(`/app/notebook/${id}`);
        } else if (selectedNb) {
            await renameNotebook({ notebookId: selectedNb._id, title, sessionId });
        }
        setIsNotebookDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!selectedNb) return;
        if (window.confirm(`Delete "${selectedNb.title}" and all its sources?`)) {
            await deleteNotebook({ notebookId: selectedNb._id, sessionId });
        }
        handleMenuClose();
    };

    const handleToggleStar = async (e: React.MouseEvent, nbId: any) => {
        e.stopPropagation();
        e.preventDefault();
        await toggleStar({ notebookId: nbId, sessionId });
    };

    const filteredNotebooks = notebooks?.filter(nb => {
        if (tab === 2) return nb.isStarred;
        return true;
    });

    const userInitial = session?.userName ? session.userName.charAt(0).toUpperCase() : "G";

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="lg">
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: 64 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: -0.5 }}>
                            OpenNoteLM
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button
                                component={Link}
                                href="/app/settings"
                                startIcon={<Settings />}
                                color="inherit"
                                sx={{ textTransform: 'none', borderRadius: 4, fontWeight: 600, color: 'text.primary' }}
                            >
                                Settings
                            </Button>
                            <IconButton onClick={handleAvatarClick} size="small" sx={{ p: 0 }}>
                                <Avatar sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: 'primary.main',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    border: '2px solid',
                                    borderColor: 'divider'
                                }}>
                                    {userInitial}
                                </Avatar>
                            </IconButton>
                        </Stack>
                    </Stack>
                </Container>
            </AppBar>

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

            <Container maxWidth="lg" sx={{ mt: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, mb: 1, color: 'text.primary' }}>Notebooks</Typography>
                        <Typography variant="body1" color="text.secondary">Manage your research and documents.</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenCreateDialog}
                        sx={{ borderRadius: 10, px: 3, py: 1, textTransform: 'none', fontWeight: 600 }}
                    >
                        New Notebook
                    </Button>
                </Box>

                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Tab label="Recent" value={1} sx={{ textTransform: 'none', fontWeight: 600 }} />
                    <Tab label="Starred" value={2} sx={{ textTransform: 'none', fontWeight: 600 }} />
                </Tabs>

                <Grid container spacing={3}>
                    {/* Create New Notebook - ALWAYS FIRST */}
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Card
                            elevation={0}
                            sx={{
                                height: 160,
                                borderRadius: 2, // 8px (conservative)
                                border: '1px dashed',
                                borderColor: theme.palette.mode === 'light' ? 'primary.light' : 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: '0.2s',
                                cursor: 'pointer',
                                bgcolor: 'transparent',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: (theme.palette as any).surfaceVariant || '#F3F3F3'
                                }
                            }}
                            onClick={handleOpenCreateDialog}
                        >
                            <Box sx={{ textAlign: 'center' }}>
                                <Add color="primary" sx={{ fontSize: 32, mb: 1 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Create Notebook</Typography>
                            </Box>
                        </Card>
                    </Grid>

                    {/* Existing Notebooks */}
                    {filteredNotebooks?.map((nb) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={nb._id}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    borderRadius: 2, // 8px (conservative)
                                    border: '1px solid',
                                    borderColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.12)' : 'divider',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    bgcolor: 'background.paper',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: (theme.palette as any).surfaceVariant || '#F3F3F3',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <CardActionArea component={Link} href={`/app/notebook/${nb._id}`} sx={{ p: 3, height: '100%' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Folder color="primary" sx={{ fontSize: 32 }} />
                                        <Stack direction="row">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleToggleStar(e, nb._id)}
                                                sx={{ color: nb.isStarred ? 'warning.main' : 'text.disabled' }}
                                            >
                                                {nb.isStarred ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, nb)}
                                                sx={{ mt: -0.5, mr: -1 }}
                                            >
                                                <MoreVert fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineBreak: 'anywhere', color: 'text.primary' }}>{nb.title}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        Updated {new Date(nb._creationTime).toLocaleDateString()}
                                    </Typography>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleOpenRenameDialog}>Rename</MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>
            </Menu>

            {/* Notebook Create/Rename Dialog */}
            <Dialog
                open={isNotebookDialogOpen}
                onClose={() => setIsNotebookDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 320 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {notebookDialogMode === 'create' ? "Create New Notebook" : "Rename Notebook"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        autoFocus
                        margin="dense"
                        label="Notebook Title"
                        value={notebookTitle}
                        onChange={(e) => setNotebookTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveNotebook()}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setIsNotebookDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveNotebook}
                        sx={{ borderRadius: 10, px: 3, fontWeight: 600 }}
                    >
                        {notebookDialogMode === 'create' ? "Create" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
