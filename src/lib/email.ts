import nodemailer from 'nodemailer'

export interface ContactFormData {
  name: string
  email: string
  message: string
}

function createTransport() {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  return nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail',
  })
}

export async function sendContactNotification(data: ContactFormData) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@consultoriaenmarketing.com'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://consultoriaenmarketing.com'

  const transporter = createTransport()

  await transporter.sendMail({
    from: `"Formulario Web" <noreply@consultoriaenmarketing.com>`,
    to: adminEmail,
    subject: `Nuevo contacto: ${data.name}`,
    html: `
      <h2>Nuevo mensaje desde el formulario de contacto</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td style="padding:8px;font-weight:bold">Nombre:</td><td style="padding:8px">${data.name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Email:</td><td style="padding:8px">${data.email}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Mensaje:</td><td style="padding:8px">${data.message}</td></tr>
      </table>
      <hr />
      <p style="color:#666;font-size:12px">Enviado desde ${siteUrl}</p>
    `,
  })
}
