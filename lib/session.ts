import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "opennotelm_session";

export function getOrCreateSessionId(): string {
    if (typeof window === "undefined") return ""; // SSR fallback
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
        sessionId = uuidv4();
        sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
}

export function getExistingSessionId(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(SESSION_KEY);
}

export function createNewSessionId(): string {
    if (typeof window === "undefined") return "";
    const sessionId = uuidv4();
    sessionStorage.setItem(SESSION_KEY, sessionId);
    return sessionId;
}

export function setSessionId(sessionId: string): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(SESSION_KEY, sessionId);
}

export function clearSessionId(): void {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(SESSION_KEY);
}
