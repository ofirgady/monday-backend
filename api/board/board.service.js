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
	logger.debug('board.service - query called')
	try {
		const collection = await dbService.getCollection('board')
		const boardCursor = await collection.find()	
		const boards = boardCursor.toArray()
		logger.debug('board.service - query successful')
		return boards
	} catch (error) {
		logger.error('board.service - query failed:', error)
		throw error
	}
}

async function getById(boardId) {
	logger.debug('board.service - getById called with id:', boardId)
	logger.debug('getById function called with boardId:', boardId)
	try {
		const criteria = { _id: ObjectId.createFromHexString(boardId) }
		const collection = await dbService.getCollection('board')
		const board = await collection.findOne(criteria)
		logger.debug('board.service - getById successful')
		return board 
	} catch (error) {
		logger.error('board.service - getById failed:', error)
		logger.error(`Board with id ${boardId} not found`, error)
		throw error
	}
}

async function remove(boardId) {
	logger.debug('board.service - remove called with id:', boardId)
	try {
		const criteria = { _id: ObjectId.createFromHexString(boardId) }
		const collection = await dbService.getCollection('board')
		await collection.deleteOne(criteria)
		logger.debug('board.service - remove successful')
		return boardId
	} catch (error) {
		logger.error('board.service - remove failed:', error)
		logger.error(`Cannot remove board ${boardId}`, error)
		throw error
	}
}

async function add(board) {
	logger.debug('board.service - add called')
	try {
		const collection = await dbService.getCollection('board')
		const { insertedId } = await collection.insertOne(board)
		board._id = insertedId.toString();
		logger.debug('board.service - add successful')
		return board
	} catch (error) {
		logger.error('board.service - add failed:', error)
		logger.error('Cannot insert board', error)
		throw error
	}
}

async function update(board) {
	logger.debug('board.service - update called')
	const boardToSave = { ...board }
	delete boardToSave._id // Remove the _id field from the object to be updated
	try {
		const criteria = { _id: ObjectId.createFromHexString(board._id) }
		const collection = await dbService.getCollection('board')
		await collection.updateOne(criteria, { $set: boardToSave })
		logger.debug('board.service - update successful')
		boardToSave._id = board._id
		return boardToSave
	} catch (error) {
		logger.error('board.service - update failed:', error)
		logger.error(`Cannot update board ${board._id}`, error)
		throw error
	}
}