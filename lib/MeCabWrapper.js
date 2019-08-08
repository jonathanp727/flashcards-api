import { spawn } from 'child_process';

let mecab;

// Queue implementation to call the correct cb on parse completion
let head = null;
let tail = null;

let initialized = false;

class Node {
  cb;
  next = null;
  constructor(cb) {
    this.cb = cb;
  }
}

const enqueue = cb => {
  if (head === null) {
    head = new Node(cb);
    tail = head;
  } else {
    tail.next = new Node(cb);
    tail = tail.next;
  }
}

// Assumes head isn't null
const callbackWithData = data => {
  const cb = head.cb;
  head = head.next;
  cb(data);
}

// End queue implementation

const processData = chunk => {
  const data = chunk.split('\n').map(line => {
      const arr = line.split('\t');
      // EOS
      if (arr.length === 1) {
          return [line];
      }
      const arr2 = [arr[0]].concat(arr[1].split(','));

      return {
        kanji         : arr2[0],
        lexical       : arr2[1],
        compound      : arr2[2],
        compound2     : arr2[3],
        compound3     : arr2[4],
        conjugation   : arr2[5],
        inflection    : arr2[6],
        original      : arr2[7],
        reading       : arr2[8] || '',
        pronunciation : arr2[9] || ''
      };
  }).slice(0, -2);

  callbackWithData(data);
}

const MeCabWrapper = {
  init: (cb = null) => (
    new Promise((resolve, reject) => {
      mecab = spawn('mecab');

      mecab.on('exit', function (code, signal) {
        console.log('mecab exited with ' +
                    `code ${code} and signal ${signal}`);
      });
      mecab.on('close', () => { console.log('mecab close') });

      mecab.stdout.setEncoding('utf8');
      mecab.stdout.on('readable', () => {
        let chunk = '';

        // Process all entries until none left
        while (null !== (chunk = mecab.stdout.read(1))) {

          // Read until EOS is found and process
          while (chunk.substr(-5) != '\nEOS\n') {
            chunk += mecab.stdout.read(1);
          }

          processData(chunk);
          chunk = '';
        }
      });

      mecab.stderr.on('data', (data) => {
        console.log(`mecab stderr:\n${data}`);
      });

      initialized = true;

      if (cb) {
        cb();
      }
      resolve();
    })
  ),
  parse: (str, cb = null) => (
    new Promise((resolve, reject) => {
      if (!initialized) {
        console.log('Error: Must initalize MeCab before parsing');
        reject();
        return;
      }
      
      str = str + '\n';
      if (cb) {
        enqueue(cb);
      } else {
        enqueue(resolve);
      }
      mecab.stdin.write(str);
    })
  ),
}

export default MeCabWrapper;
