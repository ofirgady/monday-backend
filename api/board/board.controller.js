import { logger } from '../../services/logger.service.js'
import { boardService } from './board.service.js'


export async function getBoards(req, res) {
    try {
        
        const boards = await boardService.query()
        res.json(boards)
    } catch (error) {
        logger.error('Failed to get boards', error)
        res.status(500).send({ error: 'Failed to get boards' })
    }
}

export async function getBoardById(req, res) {
	try {
        const boardId = req.params.id
        const board = await boardService.getById(boardId)
        res.json(board)
    } catch (error) {
        logger.error('Failed to get board', error)
        res.status(500).send({ error: 'Failed to get board' })
    }
}

export async function addBoard(req, res) {
	const board = req.body
    try {
        const addedBoard = await boardService.add(board)
        res.json(addedBoard)
    } catch (error) {
        logger.error('Failed to add board', error)
        res.status(500).send({ error: 'Failed to add board' })
    }
}

export async function updateBoard(req, res) {
	const board = req.body
    try {
        const updateBoard = await boardService.update(board)
        // TODO use socket to update all clients
        res.json(updateBoard)
    } catch (error) {
        logger.error('Failed to update board', error)
        res.status(500).send({ error: 'Failed to update board' })
    }
}

export async function removeBoard(req, res) {
	try {
        const boardId = req.params.id
        const removedBoard = await boardService.remove(boardId)

        res.send(removedBoard)
    } catch (error) {
        logger.error('Failed to remove board', error)
        res.status(500).send({ error: 'Failed to remove board' })
    }
}
