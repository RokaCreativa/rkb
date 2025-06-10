'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const ViewSwitcher = dynamic(
    () => import('./ViewSwitcher'),
    {
        ssr: false,
        loading: () => (
            <div className="md:hidden p-4 bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Cargando...</p>
            </div>
        )
    }
);

export default function DashboardClient() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/auth/signin');
        },
    });

    if (status === 'loading') {
        return (
            <div className="p-4 bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Verificando sesión...</p>
            </div>
        );
    }

    return <ViewSwitcher key={status} />;
} 