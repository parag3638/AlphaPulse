// lib/templates/types.ts

/**
 * Shared type declarations for the clinical templates Kanban board.
 *
 * These types mirror the payloads returned from the backend API
 * running on `/api/templates`. Keeping them in one place makes it
 * easier to update the rest of the codebase when the server
 * contract changes.
 */

/**
 * The valid template types supported by the system. These are
 * mutually exclusive.
 */
export type TemplateType = 'soap' | 'snippet' | 'prompt' | 'checklist'

/**
 * A column as returned from GET /columns. Columns have a stable
 * identifier (id), a human‑readable name and a position which
 * determines the display order.
 */
export type Column = {
  id: string
  name: string
  position: number
}

/**
 * The union of all possible content shapes. Each variant is a
 * discriminated union on the property key: the key itself (soap,
 * snippet, prompt, checklist) corresponds to the template type and
 * contains its specific fields.
 */
export type TemplateContent =
  | { soap: { S: string; O: string; A: string; P: string } }
  | { snippet: { section: string; text: string } }
  | { prompt: { system?: string; user: string } }
  | { checklist: { items: { text: string; done: boolean }[] } }

/**
 * A single template record as returned by the API. Note that
 * timestamps are ISO strings. The `column_id` determines which
 * lane the card appears in, `is_approved` controls whether it
 * belongs in the approved lane, and `is_archived` controls whether
 * it belongs in the archived lane. The server may update
 * `column_id` automatically when approving or archiving a card.
 */
export type TemplateItem = {
  id: string
  column_id: string
  type: TemplateType
  title: string
  tags: string[]
  content: TemplateContent
  is_approved: boolean
  // is_archived: boolean
  updated_at: string
  created_at: string
}

export interface EventsResponse {
  items: Event[]
  next: string | null
}


export type Trend = "rising" | "flat" | "falling";
export type Impact = "high" | "medium" | "low";
export type Market = "US" | "IN" | "EU" | "UK" | "GLOBAL" | string;
export type EventType = "macro" | "earnings" | "crypto" | "other" | string;

export interface Event {
  id: string;
  title: string;
  datetime_utc: string;
  impact: Impact;
  market: Market;
  type: EventType;
  symbols: string[];
  forecast?: number | null;
  previous?: number | null;
  actual?: number | null;
  unit?: string | null;
  score?: number | null;
  trend?: Trend | null;
  window_hours?: number | null;
  detail_url?: string | null;
}
