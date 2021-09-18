const ck = Cookies.withAttributes({
  path: '/',
  secure: true
})

// Element Bindings / page state

let pkey_shown = false;
let pubkey_display = document.getElementById("pubkey-display");
let privkey_display = document.getElementById("privkey-display");
let pkey_button = document.getElementById("show-hide-pkey");
let genkeys_button = document.getElementById("generate-keys-button");

pubkey_display.textContent = `Address: ${ck.get('publicKey') ?? ""}`;

pkey_button.onclick = () => {
  pkey_shown = !pkey_shown;
  if (pkey_shown) privkey_display.textContent = `Private Key: ${ck.get('privateKey') ?? ""}`
  else privkey_display.textContent="";
}

genkeys_button.onclick = () => {
  genKeys().then((res) => {
    const {publicKey, privateKey} = res;
    ck.set('publicKey', publicKey);
    ck.set('privateKey', privateKey);
    pubkey_display.textContent = `Address: ${ck.get('publicKey') ?? ""}`;
  })
}


// Helpers

const genKeys = async () => {
  let keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );
  publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  console.log(publicKey)
  console.log(privateKey)
  return {publicKey, privateKey};
}
