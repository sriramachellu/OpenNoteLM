"use client";

import { Box, Typography, Button, TextField, InputAdornment, List, ListItem, ListItemIcon, ListItemText, Checkbox, IconButton, CircularProgress, useTheme, Divider } from "@mui/material";
import { Search, Description, Language, YouTube, MoreVert, Delete, Add, CheckCircle } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

import SourcePreview from "./SourcePreview";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { Menu, MenuItem } from "@mui/material";

export default function SourcesPanel({ documents, notebookId, sessionId, activeDocumentId, setActiveDocumentId, selectedSourceIds, setSelectedSourceIds, onAddSource }: any) {
    const [search, setSearch] = useState("");
    const deleteDocument = useMutation(api.mutations.deleteDocument);
    const deleteAllDocuments = useMutation(api.mutations.deleteAllDocuments);
    const theme = useTheme() as any;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [previewDoc, setPreviewDoc] = useState<any>(null);

    const filteredDocs = documents?.filter((doc: any) =>
        doc.filename.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleDeleteAll = async () => {
        if (window.confirm("Are you sure you want to delete ALL sources from this notebook?")) {
            await deleteAllDocuments({ notebookId, sessionId });
        }
        handleMenuClose();
    };

    // ... handleToggleAll, handleToggleOne, handleDelete remain same ...
    const handleToggleAll = () => {
        if (selectedSourceIds.length === (documents?.length || 0)) {
            setSelectedSourceIds([]);
        } else {
            setSelectedSourceIds(documents.map((d: any) => d._id));
        }
    };

    const handleToggleOne = (id: string) => {
        setSelectedSourceIds((prev: string[]) =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDelete = async (e: React.MouseEvent, id: any) => {
        e.stopPropagation();
        if (window.confirm("Delete this source?")) {
            await deleteDocument({ documentId: id, sessionId });
        }
    };

    const getIcon = (type?: string) => {
        if (type === 'youtube') return <YouTube fontSize="small" />;
        if (type === 'web') return <Language fontSize="small" />;
        return <Description fontSize="small" />;
    };

    return (
        <Box sx={{ p: { xs: 1.5, md: 2 }, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>Sources</Typography>
                <IconButton size="small" onClick={handleMenuOpen}><MoreVertIcon fontSize="small" /></IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleDeleteAll} sx={{ color: 'error.main', fontSize: '0.875rem' }}>
                        <Delete fontSize="small" sx={{ mr: 1 }} /> Delete all sources
                    </MenuItem>
                </Menu>
            </Box>

            {/* Ingestion Trigger */}
            <Button
                fullWidth
                variant="outlined"
                startIcon={<Add />}
                sx={{
                    mb: 3,
                    py: 1.5,
                    borderRadius: 1, // 8px
                    borderStyle: 'dashed',
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    color: 'text.secondary',
                    borderColor: 'divider',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent' }
                }}
                onClick={onAddSource}
            >
                Add sources ({documents?.length || 0}/10)
            </Button>

            {/* Search */}
            <TextField
                fullWidth
                size="small"
                placeholder="Search sources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        bgcolor: (theme.palette as any).surfaceVariant || '#F3F3F3',
                        '& fieldset': { border: 'none' }
                    }
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search sx={{ color: (theme.palette as any).outline || '#79747E', fontSize: 20 }} />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Controls */}
            {documents && documents.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {selectedSourceIds.length} selected
                    </Typography>
                    <Button
                        size="small"
                        onClick={handleToggleAll}
                        sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 0, p: 0 }}
                    >
                        {selectedSourceIds.length === documents.length ? "Deselect all" : "Select all"}
                    </Button>
                </Box>
            )}

            {/* Sources List */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <List dense sx={{ py: 0 }}>
                    {filteredDocs.map((doc: any) => (
                        <ListItem
                            key={doc._id}
                            disablePadding
                            sx={{
                                mb: 0.5,
                                borderRadius: 1, // 8px
                                bgcolor: activeDocumentId === doc._id ? ((theme.palette as any).surfaceVariant || '#F3F3F3') : 'transparent',
                                '&:hover': { bgcolor: (theme.palette as any).surfaceVariant || '#F3F3F3' }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', px: 1, py: 0.5, cursor: 'pointer' }} onClick={() => setPreviewDoc(doc)}>
                                <Checkbox
                                    size="small"
                                    checked={selectedSourceIds.includes(doc._id)}
                                    onChange={() => handleToggleOne(doc._id)}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ p: 0.5, color: (theme.palette as any).outline }}
                                />
                                <ListItemIcon sx={{ minWidth: 32, ml: 0.5, color: activeDocumentId === doc._id ? 'primary.main' : 'text.secondary' }}>
                                    {getIcon(doc.type)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={doc.filename}
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        noWrap: true,
                                        sx: { fontWeight: activeDocumentId === doc._id ? 600 : 400, color: 'text.primary' }
                                    }}
                                />
                                <IconButton size="small" onClick={(e) => handleDelete(e, doc._id)} sx={{ ml: 0.5, opacity: 0.3, '&:hover': { opacity: 1 } }}>
                                    <Delete fontSize="inherit" />
                                </IconButton>
                            </Box>
                        </ListItem>
                    ))}
                    {documents && filteredDocs.length === 0 && (
                        <Box sx={{ mt: 4, textAlign: 'center', opacity: 0.5 }}>
                            <Typography variant="caption">No matching sources.</Typography>
                        </Box>
                    )}
                </List>
            </Box>

            {previewDoc && (
                <SourcePreview document={previewDoc} onClose={() => setPreviewDoc(null)} />
            )}
        </Box>
    );
}
