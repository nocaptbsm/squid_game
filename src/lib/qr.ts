import QRCode from 'qrcode'

export async function generateQRBuffer(token: string): Promise<Buffer> {
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'http://localhost:3000'
  
  // Use VERCEL_URL if available for production-ready URLs
  if (process.env.VERCEL_URL && !process.env.NEXT_PUBLIC_APP_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`
  }

  // Remove trailing slash if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const url = `${cleanBaseUrl}/p/${token}`

  return new Promise((resolve, reject) => {
    QRCode.toBuffer(
      url,
      {
        errorCorrectionLevel: 'H',
        type: 'png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      },
      (err, buffer) => {
        if (err) reject(err)
        else resolve(buffer)
      }
    )
  })
}
