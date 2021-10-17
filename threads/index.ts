import { resolve } from 'path';
import { Worker } from 'worker_threads';

export class FunctionThread {
  worker: Worker;
  constructor (func = () => {
    throw new Error('Single-purpose functional worker instantiated with no function to execute.');
  }, ...args) {
    this.worker = new Worker(
      resolve(__dirname, 'functional'),
      {
        workerData: {
          f: func.toString(),
          args
        }
      }
    );
    this.worker.unref();
  }

  join () {
    return new Promise((resolve, reject) => {
      this.worker.on('message', resolve);
      this.worker.on('exit', code => code ? reject(code) : resolve(code));
      this.worker.on('error', reject);
    });
  }
}
