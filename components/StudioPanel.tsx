"use client";

import { Box, Typography, Card, CardActionArea, Stack, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider, CircularProgress, useTheme, Avatar } from "@mui/material";
import { Edit, Description, Psychology, Quiz, ViewQuilt, Close, Delete, OpenInNew, ArrowForwardIos, Settings, ArrowBack } from "@mui/icons-material";
import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import StudioFlashcards from "./StudioFlashcards";
import StudioQuiz from "./StudioQuiz";
import StudioMindMap from "./StudioMindMap";
import StudioGenerationZone from "./StudioGenerationZone";

const ACTIONS = [
    { title: "Mind Map", subtitle: "Visualize key themes", icon: <Psychology />, query: "Generate a high-level mind map of the main topics and key themes found in the provided sources. Focus on the core architecture of ideas rather than exhaustive details. Use a hierarchical markdown structure with headings (#, ##) and nested bullets." },
    { title: "Flashcards", subtitle: "Test your knowledge", icon: <ViewQuilt />, query: "Generate a set of 5-8 flashcards with questions and answers. FORMAT: Q: [Question] A: [Answer] on separate lines." },
    { title: "Quiz", subtitle: "Challenging assessment", icon: <Quiz />, query: "Generate a challenging quiz with 5 multiple choice questions. FORMAT: Question 1: [Text]\na) [Option]\nb) [Option]\nc) [Option]\nd) [Option]\nCorrect Answer: [Option Text]\nExplanation: [Brief why]" },
];

export default function StudioPanel({ notebookId, sessionId, selectedSourceIds }: { notebookId: any, sessionId: string, selectedSourceIds?: string[] }) {
    const notebook = useQuery(api.queries.getNotebook, { notebookId });
    const notes = useQuery(api.queries.getNotes, { notebookId });
    const session = useQuery(api.queries.getSession, { sessionId });
    const deleteNote = useMutation(api.mutations.deleteNote);
    const updateNote = useMutation(api.mutations.updateNote);
    const createNote = useMutation(api.mutations.createNote);
    const updateStudioConfig = useMutation(api.mutations.updateStudioConfig);
    const generateStudioNote = useAction(api.actions.callGemini.generateStudioNote);
    const theme = useTheme() as any;

    const [viewMode, setViewMode] = useState<'lobby' | 'generating' | 'result'>('lobby');
    const [activeAction, setActiveAction] = useState<any>(null);
    const [activeResult, setActiveResult] = useState<any>(null);

    const [openNote, setOpenNote] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");

    const [configAction, setConfigAction] = useState<any>(null);
    const [customPrompt, setCustomPrompt] = useState("");

    const userInitial = session?.userName ? session.userName.charAt(0).toUpperCase() : "G";

    const handleOpenNote = (note: any) => {
        setActiveAction(ACTIONS.find(a => a.title === note.type) || { title: note.type });
        setActiveResult(note);
        setViewMode('result');
    };

    const handleSaveEdit = async () => {
        const noteToUpdate = openNote || activeResult;
        if (noteToUpdate) {
            await updateNote({
                noteId: noteToUpdate._id,
                title: editTitle,
                content: editContent,
                sessionId
            });
            setIsEditing(false);
            const updated = { ...noteToUpdate, title: editTitle, content: editContent };
            if (openNote) setOpenNote(updated);
            if (activeResult) setActiveResult(updated);
        }
    };

    const handleGenerate = async (action: any) => {
        if (viewMode === 'generating') return;
        setActiveAction(action);
        setViewMode('generating');
        try {
            const result = await generateStudioNote({
                sessionId,
                notebookId,
                type: action.title,
                query: action.query,
                customInstruction: notebook?.studioConfig?.[action.title],
                selectedSourceIds: (selectedSourceIds || []) as any[]
            });
            const noteId = await createNote({
                sessionId,
                notebookId,
                type: action.title,
                title: `${action.title} - ${new Date().toLocaleTimeString()}`,
                content: result.content
            });
            setActiveResult({ _id: noteId, title: `${action.title} - ${new Date().toLocaleTimeString()}`, content: result.content, type: action.title });
            setViewMode('result');
        } catch (err) {
            console.error(err);
            alert("Generation failed. Check console for details.");
            setViewMode('lobby');
        }
    };

    const renderResult = () => {
        if (!activeResult) return null;
        switch (activeResult.type) {
            case 'Flashcards': return <StudioFlashcards content={activeResult.content} />;
            case 'Quiz': return <StudioQuiz content={activeResult.content} />;
            case 'Mind Map': return <StudioMindMap content={activeResult.content} />;
            default: return (
                <Box sx={{ p: 2 }}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }: any) => <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.6, color: 'text.primary' }}>{children}</Typography>,
                            li: ({ children }: any) => <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.6, color: 'text.primary' }}>{children}</Typography>,
                            h1: ({ children }: any) => <Typography variant="h4" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>{children}</Typography>,
                            h2: ({ children }: any) => <Typography variant="h5" sx={{ mt: 2, mb: 1.5, fontWeight: 600 }}>{children}</Typography>,
                            h3: ({ children }: any) => <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>{children}</Typography>,
                            table: ({ children }: any) => (
                                <Box sx={{ overflowX: 'auto', my: 2 }}>
                                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid', borderColor: 'divider' }}>
                                        {children}
                                    </Box>
                                </Box>
                            ),
                            thead: ({ children }: any) => <Box component="thead" sx={{ bgcolor: (theme.palette as any).surfaceVariant || '#E7E0EC' }}>{children}</Box>,
                            th: ({ children }: any) => <Box component="th" sx={{ border: '1px solid', borderColor: 'divider', p: 1, textAlign: 'left', fontWeight: 600 }}>{children}</Box>,
                            td: ({ children }: any) => <Box component="td" sx={{ border: '1px solid', borderColor: 'divider', p: 1 }}>{children}</Box>,
                        } as any}
                    >
                        {activeResult.content}
                    </ReactMarkdown>
                </Box>
            );
        }
    };

    const handleOpenConfig = (e: React.MouseEvent, action: any) => {
        e.stopPropagation();
        setConfigAction(action);
        setCustomPrompt(notebook?.studioConfig?.[action.title] || "");
    };

    const handleSaveConfig = async () => {
        const newConfig = { ...(notebook?.studioConfig || {}), [configAction.title]: customPrompt };
        await updateStudioConfig({ notebookId, config: newConfig, sessionId });
        setConfigAction(null);
    };

    return (
        <Box sx={{ p: { xs: 1.5, md: 2 }, pr: { xs: 1.5, md: 1.5 }, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', position: 'relative', overflow: 'hidden' }}>
            {viewMode === 'lobby' ? (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>Studio</Typography>
                    </Box>

                    {/* Action Cards */}
                    <Stack spacing={1} sx={{ mb: 4 }}>
                        {ACTIONS.map((action, idx) => (
                            <Card key={idx} variant="outlined" sx={{
                                borderRadius: 1, // 8px
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                position: 'relative',
                                '&:hover': { bgcolor: (theme.palette as any).surfaceVariant || '#F3F3F3' }
                            }}>
                                <CardActionArea
                                    onClick={() => handleGenerate(action)}
                                    sx={{ p: 1.5, pr: 6 }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 1, // 8px
                                            bgcolor: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'primary.contrastText'
                                        }}>
                                            {action.icon}
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>{action.title}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{action.subtitle}</Typography>
                                        </Box>
                                    </Box>
                                </CardActionArea>
                                <IconButton
                                    size="small"
                                    onClick={(e) => handleOpenConfig(e, action)}
                                    sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
                                >
                                    <Settings fontSize="small" />
                                </IconButton>
                            </Card>
                        ))}
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    {/* Saved Notes List */}
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, px: 1 }}>Library</Typography>
                    <Box sx={{ flex: 1, overflowY: 'auto', mt: 1 }}>
                        {notes?.map((note: any) => (
                            <Box
                                key={note._id}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 1,
                                    mb: 1,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    transition: '0.2s',
                                    '&:hover': { bgcolor: (theme.palette as any).surfaceVariant || '#F3F3F3' }
                                }}
                                onClick={() => handleOpenNote(note)}
                            >
                                <Box sx={{ color: 'primary.main' }}>
                                    {ACTIONS.find(a => a.title === note.type)?.icon || <Description />}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>{note.title}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{note.type}</Typography>
                                </Box>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteNote({ noteId: note._id, sessionId }); }}>
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                </>
            ) : viewMode === 'generating' ? (
                <StudioGenerationZone tool={activeAction?.title || "Content"} />
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={() => setViewMode('lobby')}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>{activeAction?.title}</Typography>
                        <Box sx={{ flex: 1 }} />
                        {/* Hide edit button for specialized results */}
                        {!['Flashcards', 'Quiz', 'Mind Map'].includes(activeResult.type) && (
                            <IconButton onClick={() => {
                                setOpenNote(activeResult);
                                setEditTitle(activeResult.title);
                                setEditContent(activeResult.content);
                                setIsEditing(true);
                            }}>
                                <Edit />
                            </IconButton>
                        )}
                        <IconButton onClick={() => setViewMode('lobby')}>
                            <Close />
                        </IconButton>
                    </Box>
                    <Divider />
                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        {renderResult()}
                    </Box>
                </Box>
            )}

            {/* Note View/Edit Dialog */}
            <Dialog open={isEditing} onClose={() => setIsEditing(false)} fullWidth maxWidth="md">
                <DialogTitle>
                    <TextField
                        fullWidth
                        variant="standard"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Note Title"
                    />
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={15}
                        variant="outlined"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveEdit}>Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Config Dialog */}
            <Dialog open={Boolean(configAction)} onClose={() => setConfigAction(null)} fullWidth maxWidth="sm">
                <DialogTitle>Configure {configAction?.title}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Add custom instructions for how the AI should generate this {configAction?.title}.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        placeholder="e.g. Focus on technical terms, use a professional tone..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfigAction(null)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveConfig}>Save Configuration</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
