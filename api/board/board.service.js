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

async function query(filterBy = {}) {
	try {
		const criteria = _buildCriteria(filterBy)
		const sort = _buildSort(filterBy)

		const collection = await dbService.getCollection('board')
		const boardCursor = await collection.find(criteria, { sort })

		const boards = await boardCursor.toArray()
		return boards
	} catch (error) {
		logger.error('Cannot find boards', error)
		throw error
	}
}

async function getById(boardId) {
	try {
		const criteria = { _id: ObjectId.createFromHexString(boardId) }

		const collection = await dbService.getCollection('board')
		const board = await collection.findOne(criteria)

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

function _buildCriteria(filterBy) {
	const criteria = {}
	return criteria
}

function _buildSort(filterBy) {
	if (!filterBy.sortField) return {}
	return { [filterBy.sortField]: filterBy.sortDir }
}
