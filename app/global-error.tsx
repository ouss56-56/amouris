'use client'
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: 'red' }}>A critical application error occurred!</h2>
          <p>{error.message}</p>
          <pre style={{ textAlign: 'left', background: '#f4f4f4', padding: '1rem', overflowX: 'auto' }}>
            {error.stack}
          </pre>
          <button onClick={() => reset()} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>Try again</button>
        </div>
      </body>
    </html>
  )
}
