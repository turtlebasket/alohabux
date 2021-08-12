// let ip;
// fetch('http://www.ipinfo.io/ip').then(data => {
//   ip = data;
// })

let miner_id = createUUID();
let chain = [];
let current_transactions = []
let peers = []
const BLOCK_SIZE = 5;
var MT = new Multithread(4);

// Listeners

// Function/BC action defs

const refreshPeers = () => {
  peers = []
}

const refreshChain = () => {
  chain = [];
}

const initialize_raw = () => {
  // let hash;
  digestTxt("").then(dat => {
    const block = {
      timestamp: Date.now() / 1000 | 0,
      data: {},
      hash: dat,
      prevHash: ""
    }
    chain.push(block);
    console.log(block)
    current_transactions = [];
  });
}

const addBlock = () => {
  if (current_transactions.length != BLOCK_SIZE) return
  let data = current_transactions;
  let hdata = [];
  let prevHash;
  if (chain.length > 0) prevHash = chain[chain.length - 1].hash
  else return
  current_transactions.forEach(t => {
    hdata.push(`${t.timestamp} ${t.sender} ${t.recipient} ${t.amount}`);
  });
  hdata.push(prevHash);
  mineBlock(prevHash).then(nonce => {
    digestTxt(...hdata).then(hash => {
      const block = {
        timestamp: Date.now() / 1000 | 0,
        data: data,
        hash: hash,
        prevHash: prevHash,
        nonce: nonce
      }
      chain.push(block);
      console.log(block)
      current_transactions = [];
    });
  });
}

// proof of work: shitty hashcash clone; currently taking way too long
const mineBlock = async (data) => { 
  if (current_transactions.length != BLOCK_SIZE) return;
  console.log("Mining block.")
  let x = 5;
  let y = 0;
  while (true) {
  // for (let i of [1, 2, 3]) {
    let val = await digestTxt(data, `${x*y}`);
    if (val[val.length - 1 ?? 5 ] != 0) { // check if last character zero
      y += 1;
    } else {
      return y;
    }
  }
}

const addTransaction = (sender, recipient, amount) => {
  current_transactions.push({
    timestamp: Date.now() / 1000 | 0,
    sender: sender,
    recipient: recipient,
    amount: amount
  })
  if (current_transactions.length == 5) { addBlock() }
}

// Helper stuff

async function digestTxt(message) {
  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}

function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
     var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
     return v.toString(16);
  });
}

// init
initialize_raw();