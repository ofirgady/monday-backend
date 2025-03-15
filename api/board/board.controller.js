import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'
import { boardService } from './board.service.js'

export async function getBoards(req, res) {
    logger.debug('board.controller - getBoards called')
    try {
        const boards = await boardService.query()
        logger.debug('board.controller - getBoards successful')
        res.json(boards)
    } catch (error) {
        logger.error('board.controller - getBoards failed:', error)
        logger.error('Failed to get boards', error)
        res.status(500).send({ error: 'Failed to get boards' })
    }
}

export async function getBoardById(req, res) {
    logger.debug('board.controller - getBoardById called with id:', req.params.id)
    try {
        const boardId = req.params.id
        const board = await boardService.getById(boardId)
        logger.debug('board.controller - getBoardById successful')
        res.json(board)
    } catch (error) {
        logger.error('board.controller - getBoardById failed:', error)
        logger.error('Failed to get board', error)
        res.status(500).send({ error: 'Failed to get board' })
    }
}

export async function addBoard(req, res) {
    logger.debug('board.controller - addBoard called with body:', req.body)
    const board = req.body
    try {
        const addedBoard = await boardService.add(board)
        logger.debug('board.controller - addBoard successful, boardId:', addedBoard._id)
        await socketService.broadcast({ type: 'updated-board', data: addedBoard._id, room: addedBoard._id
            , userId: req.user._id 
        })
        res.json(addedBoard)
    } catch (error) {
        logger.error('board.controller - addBoard failed:', error)
        logger.error('Failed to add board', error)
        res.status(500).send({ error: 'Failed to add board' })
    }
}

export async function updateBoard(req, res) {
    logger.debug('board.controller - updateBoard called')
    const board = req.body
    const boardId = req.params.id

    try {
        const updatedBoard = await boardService.update(board)
        logger.debug('board.controller - updateBoard successful')
        await socketService.broadcast({ type: 'updated-board', data: updatedBoard, room: 'board:' + boardId
            , userId: req.user._id 
        })
        res.json(updatedBoard)
    } catch (error) {
        logger.error('board.controller - updateBoard failed:', error)
        logger.error('Failed to update board', error)
        res.status(400).send('Encountered an error trying to update board');
    }
}

export async function removeBoard(req, res) {
    logger.debug('board.controller - removeBoard called with id:', req.params.id)
    try {
        const boardId = req.params.id
        const removedBoardId = await boardService.remove(boardId)
        logger.debug('board.controller - removeBoard successful, boardId:', removedBoardId)
        await socketService.broadcast({ type: 'deleted-board', data: boardId, room: boardId
            , userId: req.user._id 
        })
        res.send(removedBoardId)
    } catch (error) {
        logger.error('board.controller - removeBoard failed:', error)
        logger.error('Failed to remove board', error)
        res.status(500).send({ error: 'Failed to remove board' })
    }
}
