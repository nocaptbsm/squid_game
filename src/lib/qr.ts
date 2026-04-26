import QRCode from 'qrcode'

export async function generateQRBuffer(text: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    QRCode.toBuffer(
      text,
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
