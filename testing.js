// Import
const { Transaction } = require("algosdk");
const algosdk = require("algosdk");
const fs = require("fs");

// Create client object to connect to sandbox's algod client
const algodToken =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const algodServer = "http://localhost";
const algodPort = 4001;
const client = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// The accounts below should be generated with the createAccount() function

// Creator account
const mnenonic = "...";
const account = algosdk.mnemonicToSecretKey(mnenonic);
const accAdd = "...";

// Merchant account:
const merchMnemonic = "...";
const merchAccount = algosdk.mnemonicToSecretKey(merchMnemonic);
const merchAddr = "...";

// CRI account:
const CriMnemonic = "...";
const CriAccount = algosdk.mnemonicToSecretKey(CriMnemonic);
const CriAddr = "...";

// Utility variables

// The following variables have to be changed after the deploy of the contract
let smartContractAddress =
  "EXS3TYR5UJFMF2IIKBUFUTRMI7GNHALVRA7WATV2ONN4ROSOD6QDWWA7DM";
let appId = 16;
let assetId = 19;

// Steps:
let doStartingTasks = false; //deploy, fund the contract and asset creation
let doOptInAndAssignRole = false; // creator opt-in into app and ASA
let buyToken = false; //creator buy smart ASA using ALGO
let payMerchant_ = false; // Creator pay a merchant using smart ASA
let donor_transfer = false; // Transfer from creator to CRI

main();

/* assetOptIn(merchAccount,19); */
/* assign_merch_role();
 */ /* assign_redcross_role();
 */

async function main() {
  if (doStartingTasks) {
    appId = await deploy();

    console.log("App created with appId: " + appId);
    smartContractAddress = algosdk.getApplicationAddress(appId);
    console.log("Application address: " + smartContractAddress);

    // Transfer Algo to SC account
    await algoTranfer(account, smartContractAddress, 1000000);

    // Smart Asa creation
    assetId = await assetCreateMethod();
    console.log("Smart ASA crated with ID: " + assetId);
  }

  if (doOptInAndAssignRole) {
    // Opt-in
    await assetOptIn(account, assetId);
    console.log("User has opted into the asset");
    await appOptIn(account, appId);
    console.log("User has opted into the application");

    // Assign roles
    await assign_donor_role();
    console.log("Role assigned");
  }

  if (buyToken) {
    donor_buy_token();
  }

  if (payMerchant_) {
    pay_merchant();
  }

  if (donor_transfer) {
    donor_transfer_asa();
  }
}

async function deploy() {
  // get node suggested parameters
  let params = await client.getTransactionParams().do();

  // declare onComplete as NoOp
  onComplete = algosdk.OnApplicationComplete.NoOpOC;

  const approvalProgram = fs.readFileSync("crt_approval.teal").toString();
  const clearStateProgram = fs.readFileSync("crt_clearstate.teal").toString();

  const compiledApprovalProgram = await client.compile(approvalProgram).do();
  const compiledClearState = await client.compile(clearStateProgram).do();

  const codificatoApproval = new Uint8Array(
    Buffer.from(compiledApprovalProgram.result, "base64")
  );
  const codificatoClear = new Uint8Array(
    Buffer.from(compiledClearState.result, "base64")
  );

  // create unsigned transaction
  let txn = algosdk.makeApplicationCreateTxn(
    account.addr,
    params,
    onComplete,
    codificatoApproval,
    codificatoClear,
    4,
    0,
    4,
    7,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    1
  );
  let txId = txn.txID().toString();

  // Sign the transaction
  let signedTxn = txn.signTxn(account.sk);
  console.log("Signed transaction with txID: %s", txId);

  // Submit the transaction
  await client.sendRawTransaction(signedTxn).do();

  // Wait for transaction to be confirmed
  confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
  //Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );

  // display results
  let transactionResponse = await client
    .pendingTransactionInformation(txId)
    .do();
  let appId = transactionResponse["application-index"];

  return appId;
}

async function assetCreateMethod() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 1000;

  // Read in the local contract.json file
  const buff = fs.readFileSync("crt.json");

  // Parse the json file into an object, pass it to create an ABIContract object
  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));

  const commonParams = {
    appID: appId, //contract.networks[genesis_hash].appID,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("asset_create", contract),
    methodArgs: [],
    ...commonParams,
  });

  const result = await atc.execute(client, 2);
  const buffer = result.methodResults[0].rawReturnValue;

  var assetId = buffer.readUIntBE(0, Uint8Array.length);

  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }

  return assetId;
}

async function algoTranfer(sender, receiver, amount) {
  let params = await client.getTransactionParams().do();
  // comment out the next two lines to use suggested fee
  params.fee = algosdk.ALGORAND_MIN_TX_FEE;
  params.flatFee = true;

  let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender.addr,
    to: receiver,
    amount: amount,
    note: undefined,
    suggestedParams: params,
  });

  let signedTxn = txn.signTxn(sender.sk);

  let txId = txn.txID().toString();
  console.log("Signed transaction with txID: %s", txId);

  // Submit the transaction
  await client.sendRawTransaction(signedTxn).do();

  let confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
  //Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );

  accountInfo = await client.accountInformation(sender.addr).do();
  console.log("Transaction Amount: %d microAlgos", confirmedTxn.txn.txn.amt);
  console.log("Transaction Fee: %d microAlgos", confirmedTxn.txn.txn.fee);
  console.log("Account balance: %d microAlgos", accountInfo.amount);
}

async function getAccountBalance(add) {
  const accountInfo = await client.accountInformation(add).do();
  console.log("Algo: ", accountInfo.amount / 1000000);
}

async function assetOptIn(sender, assetId) {
  params = await client.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  let recipient = sender.addr;
  let revocationTarget = undefined;
  let closeRemainderTo = undefined;
  amount = 0;

  let opttxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    sender.addr,
    recipient,
    closeRemainderTo,
    revocationTarget,
    amount,
    undefined,
    assetId,
    params
  );

  let rawSignedTxn = opttxn.signTxn(sender.sk);

  let opttx = await client.sendRawTransaction(rawSignedTxn).do();
  console.log("Transaction : " + opttx.txId);
}

async function appOptIn(sender, appId) {
  params = await client.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  let opttxn = algosdk.makeApplicationOptInTxn(sender.addr, params, appId);

  let rawSignedTxn = opttxn.signTxn(sender.sk);

  let opttx = await client.sendRawTransaction(rawSignedTxn).do();
  console.log("Transaction : " + opttx.txId);
}

async function assign_donor_role() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 1000;

  const buff = fs.readFileSync("crt.json");

  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));

  const commonParams = {
    appID: appId,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("set_donor_role", contract),
    methodArgs: [account.addr, true],
    ...commonParams,
  });

  const result = await atc.execute(client, 2);
  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }
}

async function assign_merch_role() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 1000;

  const buff = fs.readFileSync("crt.json");

  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));

  const commonParams = {
    appID: appId,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("set_merchant_role", contract),
    methodArgs: [merchAccount.addr, true],
    ...commonParams,
  });

  const result = await atc.execute(client, 2);
  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }
}

async function assign_redcross_role() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 1000;

  const buff = fs.readFileSync("crt.json");
  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));

  const commonParams = {
    appID: appId,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("set_redcross_role", contract),
    methodArgs: [merchAccount.addr],
    ...commonParams,
  });

  const result = await atc.execute(client, 2);
  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }
}

async function donor_buy_token() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 1000;
  const buff = fs.readFileSync("crt.json");
  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));

  const commonParams = {
    appID: appId,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  txn = {
    txn: new Transaction({
      from: account.addr,
      to: smartContractAddress,
      amount: 10000,
      ...sp,
    }),
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("donor_buy_token", contract),
    methodArgs: [txn, assetId],
    ...commonParams,
  });

  const result = await atc.execute(client, 2);
  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }
}

async function pay_merchant() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 1000;

  const buff = fs.readFileSync("crt.json");
  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));
  const commonParams = {
    appID: appId,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("pay_merchant", contract),
    methodArgs: [assetId, 5000, account.addr, merchAccount.addr],
    ...commonParams,
  });

  const result = await atc.execute(client, 2);
  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }
}

function createAccount() {
  let account = algosdk.generateAccount();
  console.log("Account Address: ", account.addr);
  let mn = algosdk.secretKeyToMnemonic(account.sk);
  console.log("Account Mnemonic: ", mn);
}

async function donor_transfer_asa() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 1000;

  const buff = fs.readFileSync("crt.json");
  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));
  const commonParams = {
    appID: appId,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("donation_transfer", contract),
    methodArgs: [assetId, 2000, account.addr, CriAccount.addr],
    ...commonParams,
  });

  const result = await atc.execute(client, 2);
  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }
}

// Utility function to return an ABIMethod by its name
function getMethodByName(name, contract) {
  const m = contract.methods.find((mt) => {
    return mt.name == name;
  });
  if (m === undefined) throw Error("Method undefined: " + name);
  return m;
}
