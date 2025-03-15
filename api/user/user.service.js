import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
	add, // Create (Signup)
	getById, // Read (Profile page)
	update, // Update (Edit profile)
	remove, // Delete (remove user)
	query, // List (of users)
	getByUsername, // Used for Login
}

async function query(filterBy = {}) {
	logger.debug('user.service - query called with filter:', filterBy)
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            return user
        })
        logger.debug('user.service - query successful, users:', users)
        return users
    } catch (err) {
        logger.error('user.service - query failed:', err)
        throw err
    }
}

async function getById(userId) {
	logger.debug('user.service - getById called with id:', userId)
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(criteria)
        delete user.password
        logger.debug('user.service - getById successful, user:', user)
        return user
    } catch (err) {
        logger.error('user.service - getById failed:', err)
        throw err
    }
}

async function getByUsername(username) {
	logger.debug('user.service - getByUsername called with username:', username)
	try {
		const collection = await dbService.getCollection('user')
		const user = await collection.findOne({ username })
		logger.debug('user.service - getByUsername successful, user:', user)
		return user
	} catch (err) {
		logger.error('user.service - getByUsername failed:', err)
		throw err
	}
}

async function remove(userId) {
	logger.debug('user.service - remove called with id:', userId)
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }
        const collection = await dbService.getCollection('user')
        await collection.deleteOne(criteria)
        logger.debug('user.service - remove successful')
    } catch (err) {
        logger.error('user.service - remove failed:', err)
        throw err
    }
}

async function update(user) {
	logger.debug('user.service - update called with user:', user)
    try {
        const userToSave = {
            _id: ObjectId.createFromHexString(user._id),
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            imgUrl: user.imgUrl,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            isAdmin: user.isAdmin,
            activities: user.activities,
        }
        const collection = await dbService.getCollection('user')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        logger.debug('user.service - update successful, user:', userToSave)
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
	logger.debug('user.service - add called with user:', user)
	try {
		const userToAdd = {
            username: user.username,
            password: user.password,
			fullname: user.fullname,
			imgUrl: user.imgUrl,
			email: user.email,
			role: user.role,
			isActive: true,
			isAdmin: user.isAdmin,
			activities: user.activities,
		}
		const collection = await dbService.getCollection('user')
		await collection.insertOne(userToAdd)
		logger.debug('user.service - add successful, user:', userToAdd)
		return userToAdd
	} catch (err) {
		logger.error('user.service - add failed:', err)
		throw err
	}
}

function _buildCriteria(filterBy) {
	const criteria = {}
	return criteria
}