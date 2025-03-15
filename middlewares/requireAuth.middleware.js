import { config } from '../config/index.js'
import { asyncLocalStorage } from '../services/als.service.js'
import { logger } from '../services/logger.service.js'


export function requireAuth(req, res, next) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    req.user = loggedinUser


    if (config.isGuestMode && !loggedinUser) {
        req.user = { _id: '', fullname: 'Guest' }
        return next()
    }
    if (!loggedinUser) return res.status(401).send({ err: 'You\'re not authenticated' })
    next()
}

export function requireAdmin(_, res, next) {
    const { loggedinUser } = asyncLocalStorage.getStore()

    if (!loggedinUser) return res.status(401).send({ err: 'Your\'e not authenticated' })
    if (!loggedinUser.isAdmin) {
        logger.warn(loggedinUser.fullname + 'attempted to perform admin action')
        res.status(403).end({ err: 'You\'re not authorized to perform this action' })
        return
    }
    next()
}
