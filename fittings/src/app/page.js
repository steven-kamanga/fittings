"use client";

import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
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
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </main>
  );
}
