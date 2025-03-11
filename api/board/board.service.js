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

		const filteredBoard = _filterBoard(board, filterBy)
		logger.debug(`getById -> filterBy after:`, filterBy)
		return filteredBoard 
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

// Filter the board by the filterBy object
function _filterBoard(board, filterBy) {
	// If there is no filterBy object, return the board as is
	if (filterBy) {
		let { txt = '' } = filterBy
		txt = txt.toLowerCase()

		// Filter by search text
		board.groups = board.groups
			.map((group) => {
				const filteredTasks = group.tasks.filter((task) => deepSearch(task, txt, board))
				if (filteredTasks.length > 0 || deepSearch(group, txt, board)) {
					return { ...group, tasks: filteredTasks }
				}
				return null
			})
			.filter(Boolean) // Remove empty groups

		// Filter by Groups
		if (filterBy.groups && filterBy.groups.length > 0) {
			board.groups = board.groups.filter((group) => {
				return filterBy.groups.includes(group.id)
			})
		}

		// Filter by Tasks
		if (filterBy.tasks && filterBy.tasks.length > 0) {
			filterGroupsByTasks('tasks', filterBy.tasks, board)
		}

		// Filter by Members
		if (filterBy.members && filterBy.members.length > 0) {
			filterGroupsByTasks('members', filterBy.members, board)
		}

		// Filter by Status Labels
		if (filterBy.statusLabels && filterBy.statusLabels.length > 0) {
			filterGroupsByTasks('statusLabels', filterBy.statusLabels, board)
		}

		// Filter by Priority Labels
		if (filterBy.priorityLabels && filterBy.priorityLabels.length > 0) {
			filterGroupsByTasks('priorityLabels', filterBy.priorityLabels, board)
		}
	}
	return board
}

// Filters the tasks within each group of a board based on the specified filter key and values
const filterGroupsByTasks = (filterKey, filterValues, board) => {
	board.groups = board.groups
		.map((group) => {
			const filteredTasks = group.tasks.filter((task) => {
				if (filterKey === 'tasks') return filterValues.includes(task.id)
				if (filterKey === 'members')
					return task.memberIds.some((memberId) => filterValues.includes(memberId))
				if (filterKey === 'statusLabels') return filterValues.includes(task.status)
				if (filterKey === 'priorityLabels') return filterValues.includes(task.priority)
				return false
			})
			if (filteredTasks.length > 0) {
				return { ...group, tasks: filteredTasks } // Keep the group with only the filtered tasks
			}
			return null
		})
		.filter(Boolean)
}

//  Recursive function to search in all keys and values
function deepSearch(obj, searchText, board) {
	if (typeof obj === 'string') {
		return obj.toLowerCase().includes(searchText)
	}

	if (typeof obj === 'number') {
		return obj.toString().includes(searchText)
	}

	if (Array.isArray(obj)) {
		return obj.some((item) => deepSearch(item, searchText, board)) // Search inside arrays
	}

	if (typeof obj === 'object' && obj !== null) {
		return Object.entries(obj).some(([key, value]) => {
			if (key === 'status' || key === 'priority') {
				const label = board.labels.find((label) => label.id === value)
				if (label && label.title.toLowerCase().includes(searchText)) {
					return true
				}
			}

			if (key === 'memberIds' && Array.isArray(value)) {
				return value.some((memberId) => {
					const member = board.members.find((member) => member._id === memberId)
					return member && member.fullname.toLowerCase().includes(searchText)
				})
			}

			// Ensure keys and values are both searched
			return key.toLowerCase().includes(searchText) || deepSearch(value, searchText, board)
		})
	}

	return false
}