import Notice from '../models/Notice.js'

const sendSuccess = (res, message, data = null, status = 200) =>
  res.status(status).json({ success: true, message, data })

const sendError = (res, status, message) => res.status(status).json({ success: false, message, data: null })

const getPagination = (req) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100)
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

// Public: fetch active notices.
export const getNotices = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req)
    const filter = { isActive: true }

    const [total, items] = await Promise.all([
      Notice.countDocuments(filter),
      Notice.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    return sendSuccess(res, 'Notices fetched successfully.', {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch notices.')
  }
}
