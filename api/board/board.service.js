import { ObjectId } from 'mongodb'
import { logger } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'

export const boardService = {
	query,
	getById,
	remove,
	add,
	update,
}

async function query() {
	try {
		const collection = await dbService.getCollection('board')
		const boardCursor = await collection.find()	
		const boards = boardCursor.toArray()
		return boards
	} catch (error) {
			logger.error('Cannot find boards', error)
			throw error
	}
}

async function getById(boardId, filterBy = {}) {
	logger.debug('getById function called with boardId:', boardId)
	logger.debug(`getById -> filterBy before:` , filterBy)
	try {
		const collection = await dbService.getCollection('board')
		const board = await collection.findOne({ _id: ObjectId.createFromHexString(boardId) })
		if (!board) {
            throw new Error(`Board with id ${boardId} not found`)
        }
		return board 
	} catch (error) {
		logger.error(`Cannot find board ${boardId}`, error)
		throw error
	}
}

async function remove(boardId) {
	try {
		const criteria = { _id: ObjectId.createFromHexString(boardId) }
		const collection = await dbService.getCollection('board')
		await collection.deleteOne(criteria)

		return boardId
	} catch (error) {
		logger.error(`Cannot remove board ${boardId}`, error)
		throw error
	}
}

async function add(board) {
	try {
		
		const collection = await dbService.getCollection('board')
		await collection.insertOne(board)

		return board
	} catch (error) {
		logger.error('Cannot insert board', error)
		throw error
	}
}

async function update(board) {
	const boardToSave = { ...board }
	delete boardToSave._id // Remove the _id field from the object to be updated
	try {
		const criteria = { _id: ObjectId.createFromHexString(board._id) }

		const collection = await dbService.getCollection('board')

		await collection.updateOne(criteria, { $set: boardToSave })
		return board
	} catch (error) {
		logger.error(`Cannot update board ${board._id}`, error)
		throw error
	}
}

function _buildCriteria(filterBy, board) {
    const criteria = {_id: board._id}
    if (filterBy.txt) {
        const searchRegex = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            { 'title': searchRegex },
            { 'groups.title': searchRegex },
            { 'groups.tasks.title': searchRegex },
        ]

        // status and priority labels
        const statusLabels = board.labels.filter(label => label.title.toLowerCase().includes(filterBy.txt.toLowerCase())).map(label => label.id)
        const priorityLabels = board.labels.filter(label => label.title.toLowerCase().includes(filterBy.txt.toLowerCase())).map(label => label.id)
        if (statusLabels.length) {
            criteria.$or.push({ 'groups.tasks.status': { $in: statusLabels } })
        }
        if (priorityLabels.length) {
            criteria.$or.push({ 'groups.tasks.priority': { $in: priorityLabels } })
        }

        // member full names
        const memberIds = board.members.filter(member => member.fullname.toLowerCase().includes(filterBy.txt.toLowerCase())).map(member => member._id)
        if (memberIds.length) {
            criteria.$or.push({ 'groups.tasks.memberIds': { $in: memberIds } })
        }
    }
    if (filterBy.groups && filterBy.groups.length) {
        criteria['groups.id'] = { $in: filterBy.groups.map(id => ObjectId(id)) }
    }
    if (filterBy.tasks && filterBy.tasks.length) {
        criteria['groups.tasks.id'] = { $in: filterBy.tasks.map(id => ObjectId(id)) }
    }
    if (filterBy.members && filterBy.members.length) {
        criteria['groups.tasks.memberIds'] = { $in: filterBy.members.map(id => ObjectId(id)) }
    }
    if (filterBy.statusLabels && filterBy.statusLabels.length) {
        criteria['groups.tasks.status'] = { $in: filterBy.statusLabels }
    }
    if (filterBy.priorityLabels && filterBy.priorityLabels.length) {
        criteria['groups.tasks.priority'] = { $in: filterBy.priorityLabels }
    }
    return criteria
}

