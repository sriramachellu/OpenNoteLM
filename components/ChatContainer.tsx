"use client";

import { Box, Typography, TextField, IconButton, Stack, Paper, Button, Menu, MenuItem, Avatar, Chip, useTheme, Divider } from "@mui/material";
import { SmartToy, MoreVert, Send, NoteAdd, ListAlt } from "@mui/icons-material";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatContainer = forwardRef<any, any>(({ sessionId, notebookId, activeDocumentId, selectedSourceIds }, ref) => {
    const [input, setInput] = useState("");
    const messages = useQuery(api.queries.getMessages, { notebookId });
    const callGemini = useAction(api.actions.callGemini.callGemini);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const theme = useTheme();

    const clearMessages = useMutation(api.mutations.clearMessages);
    const createMessage = useMutation(api.mutations.createMessage);
    const createNote = useMutation(api.mutations.createNote);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleClearChat = async () => {
        if (window.confirm("Clear all messages in this notebook?")) {
            await clearMessages({ notebookId, sessionId });
        }
        handleMenuClose();
    };

    useImperativeHandle(ref, () => ({
        triggerQuery: (query: string) => handleSend(query)
    }));

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (query: string) => {
        if (!query.trim() || isSubmitting || isStreaming) return;
        setIsSubmitting(true);
        try {
            // 1. Create User Message
            await createMessage({
                sessionId,
                notebookId,
                role: "user",
                content: query,
                isStreaming: false
            });

            // 2. Call Gemini (AI will handle Assistant Message creation)
            await callGemini({
                sessionId,
                notebookId,
                streamId: uuidv4(),
                query,
                selectedSourceIds: selectedSourceIds || [],
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const query = input.trim();
        if (query) {
            setInput("");
            handleSend(query);
        }
    };

    const isStreaming = messages?.some(m => m.isStreaming);

    const MarkdownRenderer = ({ content }: { content: string }) => {
        return (
            <ReactMarkdown
                components={{
                    p: ({ children }: any) => <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.6, color: 'text.primary' }}>{children}</Typography>,
                    li: ({ children }: any) => <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.6, color: 'text.primary' }}>{children}</Typography>,
                    h1: ({ children }: any) => <Typography variant="h4" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>{children}</Typography>,
                    h2: ({ children }: any) => <Typography variant="h5" sx={{ mt: 2, mb: 1.5, fontWeight: 600 }}>{children}</Typography>,
                    h3: ({ children }: any) => <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>{children}</Typography>,
                    strong: ({ children }: any) => <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{children}</Box>,
                    code: ({ children }: any) => (
                        <Box component="code" sx={{
                            bgcolor: (theme.palette as any).surfaceVariant || '#E7E0EC',
                            px: 1, py: 0.5, borderRadius: 1.5,
                            fontFamily: 'monospace', fontSize: '0.9em'
                        }}>
                            {children}
                        </Box>
                    ),
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
                remarkPlugins={[remarkGfm]}
            >
                {content}
            </ReactMarkdown>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
            {/* Header */}
            <Box sx={{ px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Chat</Typography>
                <IconButton size="small" onClick={handleMenuOpen}><MoreVert /></IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleClearChat} sx={{ color: 'error.main' }}>Delete chat history</MenuItem>
                </Menu>
            </Box>

            {/* Chat Body */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {messages?.length === 0 && (
                    <Box sx={{ mt: 10, textAlign: 'center', opacity: 0.5 }}>
                        <Typography variant="h5" sx={{ mb: 1 }}>Ask about your selected sources...</Typography>
                        <Typography variant="body2">Try: "Summarize the key points" or "What are the main conclusions?"</Typography>
                    </Box>
                )}
                {messages?.map((msg: any) => (
                    <Box key={msg._id} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        width: '100%'
                    }}>
                        <Box sx={{
                            p: 2.5,
                            maxWidth: '75%',
                            minWidth: 100,
                            bgcolor: msg.role === 'user' ? ((theme.palette as any).surfaceVariant || '#E7E0EC') : 'background.paper',
                            borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                            border: msg.role === 'assistant' ? 1 : 0,
                            borderColor: 'divider',
                            position: 'relative',
                            boxShadow: 'none'
                        }}>
                            <MarkdownRenderer content={msg.content} />

                            {msg.isStreaming && (
                                <Box component="span" sx={{ display: 'inline-block', width: 6, height: 16, bgcolor: 'primary.main', ml: 0.5, verticalAlign: 'middle', animation: 'blink 1s step-end infinite', '@keyframes blink': { '50%': { opacity: 0 } } }} />
                            )}
                        </Box>
                    </Box>
                ))}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Bar */}
            <Box component="form" onSubmit={handleSubmit} sx={{ px: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 }, pt: 1, position: 'relative' }}>
                <Box sx={{
                    position: 'absolute',
                    top: -12,
                    left: { xs: 24, md: 40 },
                    bgcolor: 'background.default',
                    px: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    zIndex: 1
                }}>
                    <ListAlt sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {selectedSourceIds?.length || 0} sources selected
                    </Typography>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 10,
                        bgcolor: (theme.palette as any).surfaceVariant || '#E7E0EC',
                        border: '1px solid',
                        borderColor: 'transparent',
                        '&:focus-within': { borderColor: (theme.palette as any).outline || '#79747E' }
                    }}
                >
                    <TextField
                        fullWidth
                        multiline
                        maxRows={5}
                        placeholder="Ask about your selected sources..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isSubmitting}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': { border: 'none', '& fieldset': { border: 'none' } },
                            px: 2
                        }}
                    />
                    <IconButton
                        type="submit"
                        disabled={!input.trim() || isSubmitting || isStreaming}
                        sx={{
                            bgcolor: theme.palette.mode === 'light' ? 'black' : 'white',
                            color: theme.palette.mode === 'light' ? 'white' : 'black',
                            '&:hover': { bgcolor: theme.palette.mode === 'light' ? '#333' : '#eee' },
                            width: 40,
                            height: 40
                        }}
                    >
                        <Send sx={{ fontSize: 20 }} />
                    </IconButton>
                </Paper>
            </Box>
        </Box>
    );
});

export default ChatContainer;
