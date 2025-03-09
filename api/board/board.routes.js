import express from 'express'

import { log } from '../../middlewares/logger.middleware.js'
import { addBoard, getBoardById, getBoards, removeBoard, updateBoard } from './board.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, getBoards)

router.get('/:id', log, getBoardById)

router.post('/', log, addBoard)

router.put('/:id', updateBoard)

router.delete('/:id',log, removeBoard)


export const boardRoutes = router