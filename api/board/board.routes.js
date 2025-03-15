import express from 'express'

import { log } from '../../middlewares/logger.middleware.js'
import { addBoard, getBoardById, getBoards, removeBoard, updateBoard } from './board.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, requireAuth, getBoards)

router.get('/:id', log, requireAuth, getBoardById)

router.post('/', log, requireAuth, addBoard)

router.put('/:id', requireAuth, updateBoard)

router.delete('/:id',log, requireAuth, removeBoard)


export const boardRoutes = router