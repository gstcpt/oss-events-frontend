export const PATH_RANKS: Record<string, number> = {
    // Root level (Min rank 4)
    '/dashboard/app-settings': 4,
    '/dashboard/modules': 4,
    '/dashboard/permissions': 4,
    '/dashboard/roles': 4,
    '/dashboard/packs': 4,
    '/dashboard/logs': 4,
    '/dashboard/users/admins': 4,
    '/dashboard/companies': 4,
    '/dashboard/subscriptions': 4,
    '/dashboard/locations': 4,
    '/dashboard/rapports/companies': 4,
    '/dashboard/rapports/subscriptions': 4,
    '/dashboard/rapports/users': 4,

    // Admin level (Min rank 3)
    '/dashboard/company-settings': 3,
    '/dashboard/users/moderators': 3,
    '/dashboard/faq': 3,
    '/dashboard/privacy-policy': 3,
    '/dashboard/terms-conditions': 3,
    '/dashboard/categories': 3,
    '/dashboard/tags': 3,
    '/dashboard/forms': 3,
    '/dashboard/users/providers': 3,
    '/dashboard/users/clients': 3,
    '/dashboard/blogs': 3,
    '/dashboard/newsletter': 3,
    '/dashboard/rapports': 3,
    '/dashboard/rapports/users/providers': 3,
    '/dashboard/rapports/users/clients': 3,

    // Provider level (Min rank 2)
    '/dashboard/items': 2,
    '/dashboard/events': 2,

    // Shared/Basic level (Min rank 1)
    '/dashboard': 1,
    '/dashboard/notifications': 1,
    '/dashboard/messages': 1,
    '/dashboard/profile': 1,
    '/dashboard/interactions': 1,
    '/dashboard/calendar': 1,
};

export const ROLE_RANK: Record<string, number> = { 'Root': 4, 'Admin': 3, 'Provider': 2, 'Client': 1 };

export function canAccess(role: string, pathname: string): boolean {
    const userRank = ROLE_RANK[role] || 0;

    // Root can access everything
    if (userRank >= 4) return true;

    // Find the most specific (longest) path that matches the current pathname
    const matchingPaths = Object.keys(PATH_RANKS).filter(path => pathname === path || pathname.startsWith(path + '/')).sort((a, b) => b.length - a.length); // Longest first

    if (matchingPaths.length > 0) {
        const requiredRank = PATH_RANKS[matchingPaths[0]];
        return userRank >= requiredRank;
    }

    // Default: allow access if it's not explicitly ranked (e.g., dashboard home, or public side)
    // but safety check for dashboard routes
    if (pathname.startsWith('/dashboard') && matchingPaths.length === 0) { return userRank >= 1; } // If it's a dashboard route but not explicitly ranked, allow it for rank 1

    return true;
}
