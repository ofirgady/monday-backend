import { Server } from 'socket.io'
import { logger } from './logger.service.js'

let io = null

export function setupSocketAPI(http) {
	io = new Server(http, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
		},
	})
	io.on('connection', (socket) => {
		logger.info(`New connected socket [id: ${socket.id}]`)

		socket.on('disconnect', () => {
			logger.info(`Socket disconnected [id: ${socket.id}]`)
		})

		socket.on('board-updated', (board) => {
			logger.info(`Board updated [id: ${board._id}]`)
			socket.broadcast.emit('board updated', board)
		})

		socket.on('task-updated', (task) => {
			logger.info(`Task updated [id: ${task.id}]`)
			socket.broadcast.emit('task updated', task)
		})

		socket.on('group-updated', (group) => {
			logger.info(`Group updated [id: ${group.id}]`)
			socket.broadcast.emit('group updated', group)
		})

		socket.on('activity-log', (activity) => {
			logger.info(`Activity log [id: ${activity.id}]`)
			socket.broadcast.emit('activity log', activity)
		})
	})
}

export function emitTo({ type, data }) {
	io.emit(type, data)
}

export function emitToUser({ type, data, userId }) {
	io.to(userId).emit(type, data)
}

export function broadcast({ type, data, room = null, userId }) {
	const excludedSocket = getUserSocket(userId)
	if (room && excludedSocket) {
		excludedSocket.broadcast.to(room).emit(type, data)
	} else if (excludedSocket) {
		excludedSocket.broadcast.emit(type, data)
	} else if (room) {
		io.to(room).emit(type, data)
	} else {
		io.emit(type, data)
	}
}

function getUserSocket(userId) {
	const sockets = io.sockets.sockets
	for (const socket of sockets.values()) {
		if (socket.userId === userId) return socket
	}
	return null
}
