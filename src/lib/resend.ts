import { Resend } from "resend"

let _resend: Resend | undefined

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.AUTH_RESEND_KEY)
  }
  return _resend
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    return Reflect.get(getResend(), prop)
  },
})
