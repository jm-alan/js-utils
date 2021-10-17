/* eslint-disable no-eval */
'use strict';
import { parentPort, workerData } from 'worker_threads';

parentPort.postMessage(eval(workerData.f)(...workerData.args));
