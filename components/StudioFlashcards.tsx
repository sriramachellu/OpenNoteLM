"use client";

import { Box, Typography, Paper, Stack, Divider, Chip, Collapse } from "@mui/material";
import { useState } from "react";

interface Flashcard {
    question: string;
    answer: string;
    citations?: string;
}

export default function StudioFlashcards({ content, citations }: { content: string, citations?: any }) {
    // Basic parser for LLM markdown output to cards
    // Expects something like "Q: ... A: ..." or similar
    const parseFlashcards = (text: string): Flashcard[] => {
        const cards: Flashcard[] = [];
        const sections = text.split(/\n(?=(?:Q:|Question:))/i);

        sections.forEach(section => {
            const lines = section.split('\n');
            let q = "";
            let a = "";
            let inAnswer = false;

            lines.forEach(line => {
                if (line.match(/^(?:Q:|Question:)/i)) {
                    q = line.replace(/^(?:Q:|Question:)\s*/i, "").trim();
                    inAnswer = false;
                } else if (line.match(/^(?:A:|Answer:)/i)) {
                    a = line.replace(/^(?:A:|Answer:)\s*/i, "").trim();
                    inAnswer = true;
                } else if (inAnswer) {
                    a += " " + line.trim();
                } else if (q) {
                    q += " " + line.trim();
                }
            });

            if (q && a) cards.push({ question: q.trim(), answer: a.trim() });
        });

        // Fallback for simple bullet points if Q: A: format fails
        if (cards.length === 0) {
            const lines = text.split('\n').filter(l => l.trim());
            for (let i = 0; i < lines.length; i += 2) {
                if (lines[i] && lines[i + 1]) {
                    cards.push({
                        question: lines[i].replace(/^[-*]\s*/, ""),
                        answer: lines[i + 1].replace(/^[-*]\s*/, "")
                    });
                }
            }
        }

        return cards;
    };

    const cards = parseFlashcards(content);

    return (
        <Stack spacing={3} sx={{ py: 2 }}>
            {cards.map((card, idx) => (
                <FlashcardItem key={idx} card={card} index={idx + 1} />
            ))}
        </Stack>
    );
}

function FlashcardItem({ card, index }: { card: Flashcard, index: number }) {
    const [showAnswer, setShowAnswer] = useState(false);

    return (
        <Paper
            elevation={0}
            onClick={() => setShowAnswer(!showAnswer)}
            sx={{
                p: 3,
                borderRadius: 1, // 8px
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(92, 78, 229, 0.02)'
                }
            }}
        >
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, mb: 1, display: 'block' }}>
                FLASHCARD {index}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, lineHeight: 1.4 }}>
                {card.question}
            </Typography>

            <Collapse in={showAnswer}>
                <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                        {card.answer}
                    </Typography>
                </Box>
            </Collapse>

            {!showAnswer && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 1, display: 'block' }}>
                    Click to reveal answer...
                </Typography>
            )}
        </Paper>
    );
}
