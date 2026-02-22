interface AuditLogEntry {
  id: string
  action: string
  actor: string
  changes: Record<string, unknown>
  createdAt: string
}

interface AuditTrailTableProps {
  logs: AuditLogEntry[]
}

export function AuditTrailTable({ logs }: AuditTrailTableProps) {
  if (logs.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No audit log entries yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Time</th>
            <th className="px-4 py-3 text-left font-medium">Action</th>
            <th className="px-4 py-3 text-left font-medium">Actor</th>
            <th className="px-4 py-3 text-left font-medium">Changes</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b">
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {new Date(log.createdAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-md border bg-muted px-2 py-0.5 text-xs font-medium">
                  {log.action.replace(/_/g, " ")}
                </span>
              </td>
              <td className="px-4 py-3">{log.actor}</td>
              <td className="px-4 py-3 max-w-[300px]">
                <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                  {JSON.stringify(log.changes, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
