/**
 * Created by yang on 2015/6/24.
 */
'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import { sequelize, Sequence } from '../models.js';

const CACHE_SIZE = 5;
const INIT_VALUE = 100;
const GLOBAL_ID = 'global_id';

const SQL_SELECT_SEQ = "SELECT `seq_name` AS `seqName`, `seq_value` AS `seqValue` FROM `sequence` AS `Sequence`"
    + " WHERE `Sequence`.`seq_name` = 'global_id' FOR UPDATE";

let currentSeqValue = INIT_VALUE;
let maxSeqValue = 0;

export function getNextId(max) {
    if (max) {
        let tasks = _.range(max).map(() => {
            return seq.getNextId();
        });

        return Promise.all(tasks);
    } else {
        if (currentSeqValue < maxSeqValue) {
            return Promise.resolve(++currentSeqValue);
        }
        return setupSeqValue().then(() => {
            return Promise.resolve(++currentSeqValue);
        });
    }
};

function setupSeqValue() {
    return new Promise((resolve, reject) => {
        sequelize.transaction({autocommit: false}).then((t) => {
            sequelize.query(SQL_SELECT_SEQ, {
                type: sequelize.QueryTypes.SELECT,
                transaction: t,
                model: Sequence
            }).then((seq) => {
                if (seq[0]) {
                    let _seqValueInDb = seq[0].seqValue;
                    //console.log('_seqValueInDb:', _seqValueInDb, ', currentSeqValue:', currentSeqValue);
                    if (currentSeqValue === INIT_VALUE || _seqValueInDb <= currentSeqValue) {
                        currentSeqValue = _seqValueInDb;
                        maxSeqValue = currentSeqValue + CACHE_SIZE;
                        //console.log('currentSeqValue:', currentSeqValue);
                        return Sequence.update({
                            seqValue: maxSeqValue
                        }, {
                            where: {seqName: GLOBAL_ID},
                            transaction: t
                        });
                    } else {
                        return Promise.resolve();
                    }
                } else {
                    currentSeqValue = INIT_VALUE;
                    maxSeqValue = currentSeqValue + CACHE_SIZE;
                    seq = {};
                    seq.seqName = GLOBAL_ID;
                    seq.seqValue = maxSeqValue;
                    return Sequence.create(seq, {transaction: t});
                }
            }).then(() => {
                t.commit();
                resolve();
            }).catch((err) => {
                t.rollback();
                reject(err);
            });
        });
    });
}





