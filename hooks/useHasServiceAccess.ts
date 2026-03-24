// hooks/useHasServiceAccess.ts
import { useEffect, useState } from 'react';
import { routePermissionsApi } from '@/services/roles-service';
import { auth } from '@/services/auth-service';

export function useHasServiceAccess(servicePrefix: string) {
    const [allowed, setAllowed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.getUser();
        if (!user) { setLoading(false); return; }

        const roles: string[] = user.roles ?? [];
        if (roles.includes('SUPER_ADMIN')) {
            setAllowed(true);
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const myKeys = await routePermissionsApi.getMyPermissions();
                const canAccess = myKeys.some(k => {
                    const path = k.slice(k.indexOf(':') + 1);
                    return path.startsWith(servicePrefix);
                });
                setAllowed(canAccess);
            } catch {
                setAllowed(false);
            } finally {
                setLoading(false);
            }
        })();
    }, [servicePrefix]);

    return { allowed, loading };
}