import Event from '../models/Event.js'

const sendSuccess = (res, message, data = null, status = 200) =>
  res.status(status).json({ success: true, message, data })

const sendError = (res, status, message) => res.status(status).json({ success: false, message, data: null })

const getPagination = (req) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100)
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

// Authenticated users: fetch active events (until end date).
export const getActiveEvents = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const filter = { isActive: true, endDate: { $gte: today } }

    const [total, items] = await Promise.all([
      Event.countDocuments(filter),
      Event.find(filter)
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    return sendSuccess(res, 'Active events fetched successfully.', {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch active events.')
  }
}
