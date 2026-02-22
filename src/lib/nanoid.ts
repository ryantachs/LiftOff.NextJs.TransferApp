export function nanoid(size = 21): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz"
  let result = ""
  const bytes = crypto.getRandomValues(new Uint8Array(size))
  for (let i = 0; i < size; i++) {
    result += chars[bytes[i] % chars.length]
  }
  return result
}
