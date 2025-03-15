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

async function getById(boardId) {
	logger.debug('getById function called with boardId:', boardId)
	logger.debug(`getById -> filterBy before:` , filterBy)
	try {
		const criteria = { _id: ObjectId.createFromHexString(boardId) }
		const collection = await dbService.getCollection('board')
		const board = await collection.findOne(criteria)
		return board 
	} catch (error) {
		logger.error(`Board with id ${boardId} not found`, error)
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
		return boardToSave
	} catch (error) {
		logger.error(`Cannot update board ${board._id}`, error)
		throw error
	}
}