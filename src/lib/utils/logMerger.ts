import { AppLogs } from "@/types/logs";

/**
 * Merges log timestamps into items based on entity and row_id.
 * @param data Array of items to augment with log dates
 * @param logs Array of logs from the system
 * @param entityName The entity name as stored in logs (e.g., 'items', 'tags', 'categories')
 */
export function mergeLogsWithData<T extends { id: number; created_at?: string; updated_at?: string }>(
    data: T[],
    logs: AppLogs[],
    entityName: string
): T[] {
    if (!logs || logs.length === 0) return data;

    // Create maps for quick lookup
    const creationLogs = new Map<string, string>(); // row_id -> created_at
    const latestUpdates = new Map<string, string>(); // row_id -> created_at

    // Sort logs once by date ascending so later updates overwrite earlier ones
    const sortedLogs = [...logs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    sortedLogs.forEach(log => {
        if (log.entity !== entityName) return;
        const rowId = String(log.row_id);
        const action = log.action?.toLowerCase();

        if (action === 'create' || action === 'created') {
            creationLogs.set(rowId, log.created_at);
        } else if (action === 'update' || action === 'updated') {
            latestUpdates.set(rowId, log.created_at);
        }
    });

    return data.map(item => {
        const rowId = String(item.id);
        return {
            ...item,
            created_at: creationLogs.get(rowId) || item.created_at,
            updated_at: latestUpdates.get(rowId) || item.updated_at
        };
    });
}
