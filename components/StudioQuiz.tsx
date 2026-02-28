"use client";

import { Box, Typography, Paper, Stack, Button, Radio, RadioGroup, FormControlLabel, FormControl, Divider, LinearProgress } from "@mui/material";
import { useState } from "react";
import { CheckCircle, Cancel } from "@mui/icons-material";

interface Question {
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
}

export default function StudioQuiz({ content }: { content: string }) {
    // Simple parser for Quiz format
    const parseQuiz = (text: string): Question[] => {
        const questions: Question[] = [];
        const sections = text.split(/\n(?=\d+\.|Question \d+)/i);

        sections.forEach(section => {
            const lines = section.split('\n').map(l => l.trim()).filter(l => l);
            let q = "";
            let opts: string[] = [];
            let correct = "";
            let expl = "";

            lines.forEach(line => {
                if (line.match(/^\d+\.|Question \d+/i)) {
                    q = line.replace(/^\d+\.|Question \d+/i, "").trim();
                } else if (line.match(/^[a-d]\)|[a-d]\./i)) {
                    opts.push(line.replace(/^[a-d]\)|[a-d]\./i, "").trim());
                } else if (line.match(/^Answer:|Correct Answer:/i)) {
                    correct = line.replace(/^Answer:|Correct Answer:/i, "").trim();
                } else if (line.match(/^Explanation:/i)) {
                    expl = line.replace(/^Explanation:/i, "").trim();
                }
            });

            if (q && opts.length > 0) {
                questions.push({
                    question: q,
                    options: opts,
                    answer: correct,
                    explanation: expl
                });
            }
        });

        return questions;
    };

    const questions = parseQuiz(content);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [complete, setComplete] = useState(false);

    if (questions.length === 0) return <Typography>No quiz questions found.</Typography>;
    if (complete) return <QuizSummary score={score} total={questions.length} onReset={() => {
        setCurrentIndex(0);
        setScore(0);
        setComplete(false);
        setIsSubmitted(false);
        setSelectedOption(null);
    }} />;

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.answer;

    const handleSubmit = () => {
        setIsSubmitted(true);
        if (isCorrect) setScore(s => s + 1);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setIsSubmitted(false);
        } else {
            setComplete(true);
        }
    };

    return (
        <Box sx={{ py: 2 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
                    QUESTION {currentIndex + 1} OF {questions.length}
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={((currentIndex + 1) / questions.length) * 100}
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'divider' }}
                />
            </Box>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 4, lineHeight: 1.4 }}>
                    {currentQ.question}
                </Typography>

                <FormControl component="fieldset" fullWidth>
                    <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                        <Stack spacing={2}>
                            {currentQ.options.map((opt, idx) => {
                                const isThisCorrect = opt === currentQ.answer;
                                const isThisSelected = opt === selectedOption;

                                let bgcolor = 'transparent';
                                let borderColor = 'divider';

                                if (isSubmitted) {
                                    if (isThisCorrect) {
                                        bgcolor = 'rgba(76, 175, 80, 0.1)';
                                        borderColor = 'success.main';
                                    } else if (isThisSelected && !isCorrect) {
                                        bgcolor = 'rgba(244, 67, 54, 0.1)';
                                        borderColor = 'error.main';
                                    }
                                } else if (isThisSelected) {
                                    borderColor = 'primary.main';
                                    bgcolor = 'rgba(92, 78, 229, 0.04)';
                                }

                                return (
                                    <Paper
                                        key={idx}
                                        elevation={0}
                                        sx={{
                                            border: '1px solid',
                                            borderColor,
                                            bgcolor,
                                            borderRadius: 1, // 8px
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <FormControlLabel
                                            value={opt}
                                            control={<Radio disabled={isSubmitted} />}
                                            label={opt}
                                            sx={{ width: '100%', m: 0, p: 1 }}
                                        />
                                    </Paper>
                                );
                            })}
                        </Stack>
                    </RadioGroup>
                </FormControl>

                {isSubmitted && (
                    <Box sx={{ mt: 4, p: 3, bgcolor: (isCorrect ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)'), borderRadius: 3 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            {isCorrect ? <CheckCircle color="success" /> : <Cancel color="error" />}
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isCorrect ? 'success.main' : 'error.main' }}>
                                {isCorrect ? "Correct!" : "Incorrect"}
                            </Typography>
                        </Stack>
                        {currentQ.explanation && (
                            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                {currentQ.explanation}
                            </Typography>
                        )}
                    </Box>
                )}

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    {!isSubmitted ? (
                        <Button
                            variant="contained"
                            disabled={!selectedOption}
                            onClick={handleSubmit}
                            sx={{ borderRadius: 10, px: 4 }}
                        >
                            Submit Answer
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{ borderRadius: 10, px: 4 }}
                        >
                            {currentIndex < questions.length - 1 ? "Next Question" : "View Summary"}
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

function QuizSummary({ score, total, onReset }: { score: number, total: number, onReset: () => void }) {
    return (
        <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>Quiz Complete!</Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
                You scored <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>{score}</Box> out of <Box component="span" sx={{ fontWeight: 800 }}>{total}</Box>
            </Typography>
            <Button variant="contained" onClick={onReset} size="large" sx={{ borderRadius: 10, px: 6 }}>
                Retake Quiz
            </Button>
        </Box>
    );
}
