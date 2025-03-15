import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'

const cryptr = new Cryptr(process.env.SECRET || 'Secret-Puk-1234')

export const authService = {
	signup,
	login,
	getLoginToken,
	validateToken,
}

async function login(username, password) {
	logger.debug('auth.service - login called with username:', username)
	logger.debug(`auth.service - login with username: ${username}`)

	const user = await userService.getByUsername(username)
	if (!user) return Promise.reject('Invalid username')

	const match = await bcrypt.compare(password, user.password)
	if (!match) return Promise.reject('Invalid password')

	delete user.password
	user._id = user._id.toString()
	logger.debug('auth.service - login successful, user:', user)
	return user
}

async function signup({ username, password, fullname, imgUrl = '', email, role, isAdmin = false }) {
	logger.debug('auth.service - signup called with username:', username)
	const saltRounds = 10

	logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
	if (!username || !password || !fullname || !email) return Promise.reject('Missing required signup information')

	const userExist = await userService.getByUsername(username)
	if (userExist) return Promise.reject('Username already taken')

	const hash = await bcrypt.hash(password, saltRounds)
	try {
		const user = await userService.add({ username, password: hash, fullname, imgUrl, email, role, isAdmin, activities: [] })
		logger.debug('auth.service - signup successful, user:', user)
		return user
	} catch (err) {
		logger.error('auth.service - signup failed:', err)
		throw err
	}
}

function getLoginToken(user) {
	logger.debug('auth.service - getLoginToken called for user:', user._id)
	const userInfo = { 
		_id: user._id, 
		fullname: user.fullname, 
		username: user.username,
		imgUrl: user.imgUrl,
		email: user.email,
		role: user.role,
		isActive: user.isActive,
		isAdmin: user.isAdmin,
		activities: user.activities,
	}
	return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
	logger.debug('auth.service - validateToken called')
	try {
		const json = cryptr.decrypt(loginToken)
		const loggedinUser = JSON.parse(json)
		return loggedinUser
	} catch (err) {
		console.log('Invalid login token')
	}
	return null
}