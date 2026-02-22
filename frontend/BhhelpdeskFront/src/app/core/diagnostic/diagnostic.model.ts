export interface DiagnosticMessage {
    id?: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at?: string;
}

export interface GeneratedSQLQuery {
    id: number;
    sql_query: string;
    explanation: string;
    is_safe: boolean;
    safety_message: string;
    affected_tables: string[];
    estimated_rows: number | null;
    executed_at?: string;
}

export interface DiagnosticSession {
    id: number;
    problem_description: string;
    state: 'DIAGNOSING' | 'SQL_GENERATED' | 'EXECUTED' | 'CANCELLED';
    messages: DiagnosticMessage[];
    sql_queries: GeneratedSQLQuery[];
    ticket?: number;
}

export interface DiagnosticChatResponse {
    session_id: number;
    message: string;
    state: string;
}
