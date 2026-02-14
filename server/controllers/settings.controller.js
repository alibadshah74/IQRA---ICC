import Settings from '../models/Settings.js'

const sendSuccess = (res, message, data = null, status = 200) =>
  res.status(status).json({ success: true, message, data })

const sendError = (res, status, message) => res.status(status).json({ success: false, message, data: null })

// Public: fetch school profile settings.
export const getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne().lean()
    return sendSuccess(res, 'Settings fetched successfully.', settings || {})
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch settings.')
  }
}
