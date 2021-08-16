let miner_id = createUUID();
let chain = [];
let current_transactions = []
let peers = []
const BLOCK_SIZE = 5;
const POW_DIFFICULTY = 4;

let miner_address = document.cookie.publicKey ?? "";
document.getElementById("start-mining-button").onclick = () => {
  miner_address = document.getElementById("wallet-input").value;
  initialize_raw();
}

// Function/BC action defs

const refreshPeers = () => {
  peers = []
}

const refreshChain = () => {
  chain = [];
}

const initialize_raw = () => {
  // let hash;
  digestTxt("init").then(dat => {
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
  mineBlock(...hdata).then(({hash, nonce}) => {
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
}

// proof of work: shitty hashcash clone; currently taking way too long for a memecoin
const mineBlock = async (data) => { 
  if (current_transactions.length != BLOCK_SIZE) return;
  console.log("Mining block.")
  let x = 5;
  let y = 0;
  while (true) {
    let valid = false;
    let val = await digestTxt(`${data}${x*y}`);
    for (let c = 0; c < POW_DIFFICULTY; c++) {
      res = parseInt(val[val.length - (c+1)]) ?? 100;

      if (!(res == 0)) { // check if res character is acceptable
        valid = false;
        break;
      } else {
        valid = true;
      }
    }

    if (!valid) {
      y += 1;
    } else {
      console.log(res)
      console.log(`Done.\nNonce: ${y}\nHash: ${val}`)
      return {val, y};
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