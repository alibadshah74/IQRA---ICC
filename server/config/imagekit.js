import ImageKit from 'imagekit'

const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env

export const isImageKitConfigured = Boolean(
  IMAGEKIT_PUBLIC_KEY && IMAGEKIT_PRIVATE_KEY && IMAGEKIT_URL_ENDPOINT,
)

const imagekit = isImageKitConfigured
  ? new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY,
      privateKey: IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    })
  : null

export const uploadToImageKit = async (fileBuffer, { fileName, folder, mimeType } = {}) => {
  if (!isImageKitConfigured || !imagekit) {
    throw new Error('ImageKit is not configured.')
  }

  const base64 = fileBuffer.toString('base64')
  const filePayload = mimeType ? `data:${mimeType};base64,${base64}` : base64

  return imagekit.upload({
    file: filePayload,
    fileName: fileName || `upload-${Date.now()}`,
    folder: folder || '/iqra/materials',
    useUniqueFileName: true,
  })
}
