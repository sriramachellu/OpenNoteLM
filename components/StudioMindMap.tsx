"use client";

import { Box, Typography, Stack, Collapse, IconButton } from "@mui/material";
import { useState } from "react";
import { ChevronRight, ExpandMore, FiberManualRecord } from "@mui/icons-material";

interface Node {
    title: string;
    level: number;
    children: Node[];
}

export default function StudioMindMap({ content }: { content: string }) {
    // Parser for hierarchical markdown (headings and lists)
    const parseMindMap = (text: string): Node[] => {
        const lines = text.split('\n').filter(l => l.trim());
        const root: Node[] = [];
        const stack: { node: Node, level: number }[] = [];

        lines.forEach(line => {
            const headingMatch = line.match(/^(#+)\s+(.+)/);
            const listMatch = line.match(/^(\s*)(?:[-*]|\d+\.)\s+(.+)/);

            if (headingMatch) {
                const level = headingMatch[1].length;
                const newNode: Node = { title: headingMatch[2], level, children: [] };

                while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                    stack.pop();
                }

                if (stack.length === 0) {
                    root.push(newNode);
                } else {
                    stack[stack.length - 1].node.children.push(newNode);
                }
                stack.push({ node: newNode, level });
            } else if (listMatch) {
                const indent = listMatch[1].length;
                const level = stack.length > 0 ? stack[stack.length - 1].level + 1 + (indent / 2) : 1;
                const newNode: Node = { title: listMatch[2], level, children: [] };

                while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                    stack.pop();
                }

                if (stack.length === 0) {
                    root.push(newNode);
                } else {
                    stack[stack.length - 1].node.children.push(newNode);
                }
                stack.push({ node: newNode, level });
            }
        });

        return root;
    };

    const nodes = parseMindMap(content);

    return (
        <Box sx={{ py: 2 }}>
            <Stack spacing={1}>
                {nodes.map((node, idx) => (
                    <MindMapNode key={idx} node={node} defaultExpanded={idx === 0} />
                ))}
            </Stack>
        </Box>
    );
}

function MindMapNode({ node, defaultExpanded = false }: { node: Node, defaultExpanded?: boolean }) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const hasChildren = node.children.length > 0;

    return (
        <Box sx={{ mb: 0.5 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 1,
                    px: 1.5,
                    borderRadius: 1, // 8px
                    cursor: hasChildren ? 'pointer' : 'default',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                    transition: '0.2s'
                }}
                onClick={() => hasChildren && setExpanded(!expanded)}
            >
                {hasChildren ? (
                    expanded ? <ExpandMore sx={{ fontSize: 18, mr: 1, opacity: 0.5 }} /> : <ChevronRight sx={{ fontSize: 18, mr: 1, opacity: 0.5 }} />
                ) : (
                    <FiberManualRecord sx={{ fontSize: 8, mr: 2, ml: 0.5, opacity: 0.3 }} />
                )}
                <Typography
                    variant={node.level === 1 ? "subtitle1" : "body2"}
                    sx={{
                        fontWeight: node.level === 1 ? 700 : 500,
                        color: node.level === 1 ? 'primary.main' : 'text.primary'
                    }}
                >
                    {node.title}
                </Typography>
            </Box>

            {hasChildren && (
                <Collapse in={expanded}>
                    <Box sx={{ ml: 3.5, borderLeft: '1px solid', borderColor: 'divider', pl: 1, mt: 0.5 }}>
                        {node.children.map((child, idx) => (
                            <MindMapNode key={idx} node={child} />
                        ))}
                    </Box>
                </Collapse>
            )}
        </Box>
    );
}
