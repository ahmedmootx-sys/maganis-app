interface ConfigErrorProps {
  message: string
}

export function ConfigErrorView({ message }: ConfigErrorProps) {
  return (
    <div className="config-error" role="alert">
      <h1>Configuration error</h1>
      <p>
        Maganis cannot start because the environment configuration is invalid.
      </p>
      <pre>{message}</pre>
      <p>
        Fix the variables listed above in the matching .env file, then reload
        this page. See the README section "Environment &amp; configuration" for
        details.
      </p>
    </div>
  )
}
