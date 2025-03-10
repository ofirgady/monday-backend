import { authService } from '../api/auth/auth.service.js'
import { logger } from '../services/logger.service.js'

export function requireAuth(req, res, next) {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Login first!')
    req.loggedinUser = loggedinUser
    next()
}
export function requireAdmin(req, res, next) {
    const loggedinUser = req.loggedinUser

    if (!loggedinUser) return res.status(401).send('Not Authenticated')
    if (!loggedinUser.isAdmin) {
        logger.warn(loggedinUser.fullname + ' attempted to perform admin action')
       return res.status(403).send('Not Authorized')
    }
    next()
}
