'use strict';

import express from 'express';
import NodeCtrl from '../controller/NodeCtrl.js';

let router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/', NodeCtrl.insertNode);
router.delete('/', NodeCtrl.deleteNode);
router.get('/children', NodeCtrl.getChildren);
router.get('/parents', NodeCtrl.getParents);

export default router;