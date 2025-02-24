'use client'

import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Home() {
    const { data: session, status } = useSession();

    return (
        <main>
            <h1>Home Page</h1>
            {status === "loading" && <p>Loading...</p>}
            {status === "unauthenticated" && <p>You are not signed in.</p>}
            {status === "authenticated" && (
                <div>
                    <h2>Welcome, {session.user.username || session.user.email}</h2>
                    <p>Email: {session.user.email}</p>
                    <p>Role: {session.user.role}</p>
                    <p>Session expires at: {session.expires}</p>
                    <h3>Access Token:</h3>
                    <pre>{session.accessToken}</pre>
                    <h3>Full Session Details:</h3>
                    <pre>{JSON.stringify(session, null, 2)}</pre>
                </div>
            )}
        </main>
    );
}