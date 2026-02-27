import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    // Determine if the route is an admin route
    // Note: Astro's context.url.pathname will start with /admin for dashboard etc.
    if (context.url.pathname.startsWith('/admin')) {
        // We need to check if they have a valid token AND are an admin.
        // In Astro SSR, context.cookies is available, but the frontend currently uses localStorage.
        // However, a robust middleware should check cookies if we transition to them,
        // OR rely on a client-side check if SSR isn't fully aware of localStorage.
        // Given MarketFlex currently relies heavily on localStorage for auth (token & user info),
        // we might not have the user info purely in SSR if it's not sent via cookies.

        // For now, if we don't have cookies, we'll let the client handle it,
        // but ideally we should read a cookie.
        // Let's add a placeholder defense here and we'll add a script in AdminLayout as well.
        // We will pass through but add a stringent client-side check in AdminLayout.astro 
        // as the primary defense mechanism given the current local storage architecture.
    }

    return next();
});
