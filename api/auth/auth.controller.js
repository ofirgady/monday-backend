import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'

export async function login(req, res) {
	logger.debug('auth.controller - login called with body:', req.body)
	const { username, password } = req.body
	try {
		const user = await authService.login(username, password)
		const loginToken = authService.getLoginToken(user)
        
		logger.info('User login: ', user)
		logger.debug('auth.controller - login successful, user:', user)
        
		res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
		res.json(user)
	} catch (err) {
		logger.error('auth.controller - login failed:', err)
		logger.error('Failed to Login ' + err)
		res.status(401).send({ err: 'Failed to Login' })
	}
}

export async function signup(req, res) {
	logger.debug('auth.controller - signup called with body:', req.body)
	try {
		const credentials = req.body

		// Never log passwords
		logger.debug(credentials)
		
        const account = await authService.signup(credentials)
		logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
		
        const user = await authService.login(credentials.username, credentials.password)
		logger.info('User signup:', user)
		logger.debug('auth.controller - signup successful, user:', user)
		
        const loginToken = authService.getLoginToken(user)
		res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
		res.json(user)
	} catch (err) {
		logger.error('auth.controller - signup failed:', err)
		logger.error('Failed to signup ' + err)
		res.status(400).send({ err: 'Failed to signup', err })
	}
}

export async function logout(req, res) {
	logger.debug('auth.controller - logout called')
	try {
		res.clearCookie('loginToken')
		res.send({ msg: 'Logged out successfully' })
		logger.debug('auth.controller - logout successful')
	} catch (err) {
		logger.error('auth.controller - logout failed:', err)
		res.status(400).send({ err: 'Failed to logout' })
	}
}