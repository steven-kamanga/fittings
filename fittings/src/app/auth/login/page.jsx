'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')

        const formData = new FormData(event.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')

        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        })

        if (result.error) {
            setError(result.error)
        } else {
            router.push('/')
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Login</button>
        </form>
    )
}