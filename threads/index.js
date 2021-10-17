'use strict';
import { Worker } from 'worker_threads';
/**
 * A wrapper for the node worker_thread Worker constructor to more closely
 * emulate the behavior of threading in other languages. Takes in a single
 * function and any arguments, and executes the code in another thread.
 */
export class FunctionThread {
  constructor (
    func = () => {
      throw new Error('Single-purpose functional worker instantiated with no function to execute.');
    },
    ...args
  ) {
    this.__joinable = false;
    this.__worker = new Worker(
      new URL(import.meta.url.match(/.*(?=index\.js$)/)[0] + 'functional'),
      {
        workerData: {
          f: func.toString(),
          args
        }
      }
    );
    this.__worker.unref();
    this.__worker.on('message', msg => {
      this.__joinable = true;
      this.value = msg;
    });
  }

  /**
   * Returns a promise that resolves when the function passed to the thread
   * constructor has completed execution.
   */
  join () {
    return new Promise((resolve, reject) => {
      if (this.__joinable) return resolve();
      this.__worker.on('message', msg => {
        if (this.__joinable) return resolve();
        this.__joinable = true;
        this.value = msg;
        resolve();
      });
      this.__worker.on('exit', code => {
        if (code) {
          reject(code);
        } else {
          this.__joinable = true;
          resolve();
        }
      });
      this.__worker.on('error', reject);
    });
  }
}

const transpose = arr => {
  const transposed = [];
  for (let i = 0; i < arr[0].length; i++) transposed.push([]);
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      transposed[j][i] = arr[i][j];
    }
  }
  return transposed;
};

const arrayBuilder = n => {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = Math.round(Math.random() * 1000000);
  }
  arr.sort((a, b) => a - b);
  return arr;
};

(async () => {
  const threads = [];
  for (let i = 0; i < 8; i++) {
    threads.push(new FunctionThread(arrayBuilder, 60));
  }
  for (let i = 0; i < threads.length; i++) {
    await threads[i].join();
  }
  console.table(transpose(threads.map(thread => thread.value)));
})();
