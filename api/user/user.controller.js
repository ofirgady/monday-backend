import {userService} from './user.service.js'
import {logger} from '../../services/logger.service.js'

export async function getUser(req, res) {
    logger.debug('user.controller - getUser called with id:', req.params.id)
    try {
        const user = await userService.getById(req.params.id)
        logger.debug('user.controller - getUser successful, user:', user)
        res.send(user)
    } catch (err) {
        logger.error('user.controller - getUser failed:', err)
        logger.error('Failed to get user', err)
        res.status(400).send({ err: 'Failed to get user' })
    }
}

export async function getUsers(req, res) {
    logger.debug('user.controller - getUsers called with query:', req.query)
    try {
        const filterBy = {
            txt: req.query?.txt || '',
            minBalance: +req.query?.minBalance || 0
        }
        const users = await userService.query(filterBy)
        logger.debug('user.controller - getUsers successful, users:', users)
        res.send(users)
    } catch (err) {
        logger.error('user.controller - getUsers failed:', err)
        logger.error('Failed to get users', err)
        res.status(400).send({ err: 'Failed to get users' })
    }
}

export async function deleteUser(req, res) {
    logger.debug('user.controller - deleteUser called with id:', req.params.id)
    try {
        await userService.remove(req.params.id)
        logger.debug('user.controller - deleteUser successful')
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('user.controller - deleteUser failed:', err)
        logger.error('Failed to delete user', err)
        res.status(400).send({ err: 'Failed to delete user' })
    }
}

export async function updateUser(req, res) {
    logger.debug('user.controller - updateUser called with body:', req.body)
    try {
        const user = req.body
        const savedUser = await userService.update(user)
        logger.debug('user.controller - updateUser successful, user:', savedUser)
        res.send(savedUser)
    } catch (err) {
        logger.error('user.controller - updateUser failed:', err)
        logger.error('Failed to update user', err)
        res.status(400).send({ err: 'Failed to update user' })
    }
}
