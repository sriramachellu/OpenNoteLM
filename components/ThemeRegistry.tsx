"use client";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const ColorModeContext = createContext({ toggleColorMode: () => { } });

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const savedMode = localStorage.getItem("theme_mode") as 'light' | 'dark';
        if (savedMode) {
            setMode(savedMode);
        } else {
            const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            setMode(systemPrefersDark ? 'dark' : 'light');
        }

        // Listen for system theme changes if no saved user preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem("theme_mode")) {
                setMode(e.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const colorMode = useMemo(() => ({
        toggleColorMode: () => {
            setMode((prevMode) => {
                const newMode = prevMode === 'light' ? 'dark' : 'light';
                localStorage.setItem("theme_mode", newMode);
                return newMode;
            });
        },
    }), []);

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            primary: {
                main: mode === 'light' ? '#000000' : '#FFFFFF',
                contrastText: mode === 'light' ? '#FFFFFF' : '#000000',
            },
            secondary: {
                main: mode === 'light' ? '#424242' : '#BDBDBD',
            },
            background: {
                default: mode === 'light' ? '#FFFFFF' : '#121212',
                paper: mode === 'light' ? '#FFFFFF' : '#121212',
            },
            divider: mode === 'light' ? '#E0E0E0' : '#2C2C2C',
            text: {
                primary: mode === 'light' ? '#000000' : '#FFFFFF',
                secondary: mode === 'light' ? '#616161' : '#BDBDBD',
            },
            // @ts-ignore
            surfaceVariant: mode === 'light' ? '#F3F3F3' : '#1E1E1E',
            onSurfaceVariant: mode === 'light' ? '#424242' : '#BDBDBD',
            outline: mode === 'light' ? '#E0E0E0' : '#2C2C2C',
        },
        shape: {
            borderRadius: 8, // Strictly conservative
        },
        typography: {
            fontFamily: 'var(--font-roboto), Inter, Roboto, sans-serif',
            h4: { fontWeight: 600, letterSpacing: -0.5 },
            h6: { fontWeight: 600 },
            subtitle1: { fontWeight: 500 },
            body1: { fontSize: '1rem', lineHeight: 1.5 },
            body2: { fontSize: '0.875rem', lineHeight: 1.43 },
            caption: { fontSize: '0.75rem', lineHeight: 1.2 },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: `
                    :root {
                        --md-sys-color-background: ${mode === 'light' ? '#FFFFFF' : '#121212'};
                        --md-sys-color-on-background: ${mode === 'light' ? '#000000' : '#FFFFFF'};
                        --md-sys-color-surface: ${mode === 'light' ? '#FFFFFF' : '#121212'};
                        --md-sys-color-on-surface: ${mode === 'light' ? '#000000' : '#FFFFFF'};
                        --md-sys-color-surface-container: ${mode === 'light' ? '#F3F3F3' : '#1E1E1E'};
                        --md-sys-color-surface-container-low: ${mode === 'light' ? '#F8F8F8' : '#1A1A1A'};
                        --md-sys-color-surface-container-high: ${mode === 'light' ? '#EDEDED' : '#222222'};
                        --md-sys-color-outline-variant: ${mode === 'light' ? '#E0E0E0' : '#2C2C2C'};
                        --md-sys-color-primary: ${mode === 'light' ? '#000000' : '#FFFFFF'};
                        --md-sys-color-on-primary: ${mode === 'light' ? '#FFFFFF' : '#000000'};
                        --md-sys-typescale-display-large-font: var(--font-roboto);
                        --md-sys-typescale-headline-large-font: var(--font-roboto);
                        --md-sys-typescale-body-large-font: var(--font-roboto);
                    }
                    body {
                        background-color: var(--md-sys-color-background);
                        color: var(--md-sys-color-on-background);
                        transition: background-color 0.2s, color 0.2s;
                    }
                    /* Custom Scrollbar Styling */
                    ::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                    }
                    ::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: ${mode === 'light' ? '#E0E0E0' : '#333333'};
                        border-radius: 10px;
                        border: 2px solid transparent;
                        background-clip: content-box;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: ${mode === 'light' ? '#BDBDBD' : '#444444'};
                        background-clip: content-box;
                    }
                    /* Firefox Support */
                    * {
                        scrollbar-width: thin;
                        scrollbar-color: ${mode === 'light' ? '#E0E0E0' : '#333333'} transparent;
                    }
                `,
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: 'none',
                        fontWeight: 600,
                        padding: '8px 20px',
                    },
                    contained: {
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        }
                    },
                    outlined: {
                        borderColor: mode === 'light' ? '#E0E0E0' : '#2C2C2C',
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        backgroundImage: 'none',
                        border: `1px solid ${mode === 'light' ? '#E0E0E0' : '#2C2C2C'}`,
                        backgroundColor: mode === 'light' ? '#FFFFFF' : '#121212',
                        boxShadow: 'none',
                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        boxShadow: 'none',
                    }
                }
            },
            MuiDivider: {
                styleOverrides: {
                    root: {
                        borderColor: mode === 'light' ? '#E0E0E0' : '#2C2C2C',
                    }
                }
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                    }
                }
            }
        }
    }), [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    {children}
                </ThemeProvider>
            </AppRouterCacheProvider>
        </ColorModeContext.Provider>
    );
}

export const useColorMode = () => useContext(ColorModeContext);
