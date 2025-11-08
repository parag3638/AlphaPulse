// lib/templates/helpers.ts
import type { TemplateItem } from './types'

/**
 * Convert a timestamp ISO string into a human friendly "Updated X ago"
 * label. This mirrors the behaviour of the existing local adapter but
 * operates on ISO strings rather than epoch numbers.
 */
export function formatUpdatedAgo(iso: string): string {
    const ts = Date.parse(iso)
    const diff = Date.now() - ts
    const mins = Math.floor(diff / (1000 * 60))
    if (mins < 60) return `Updated ${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `Updated ${hours}h ago`
    const days = Math.floor(hours / 24)
    return `Updated ${days}d ago`
}

/**
 * Human friendly label for the template type. We capitalise SOAP and
 * prefix snippet/prompt/checklist with an upper case first letter.
 */
export function typeLabel(type: TemplateItem['type']): string {
    switch (type) {
        case 'soap':
            return 'SOAP'
        case 'snippet':
            return 'Snippet'
        case 'prompt':
            return 'Prompt'
        case 'checklist':
            return 'Checklist'
        default:
            return type
    }
}

/**
 * Extract a single line preview of a template's content. The rules
 * mirror the specification: for SOAP show the subjective line,
 * snippet shows the first 100 characters of text, prompt shows
 * the first line of the user message, and checklist shows the first
 * two items prefixed with bullets.
 */
export function previewLine(item: TemplateItem): string {
    const content = item.content
    if ('soap' in content) {
        return `S: ${content.soap.S}`
    }
    if ('snippet' in content) {
        const text = content.snippet.text
        return text.slice(0, 100)
    }
    if ('prompt' in content) {
        const user = content.prompt.user
        return user.split('\n')[0]
    }
    if ('checklist' in content) {
        const items = content.checklist.items
        return items
            .slice(0, 2)
            .map((i) => `• ${i.text}`)
            .join(', ')
    }
    return ''
}
