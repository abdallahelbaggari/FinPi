// Initialize Pi SDK in Testnet mode
Pi.init({ version: "2.0", sandbox: true });

// DOM Elements
const loginBtn = document.getElementById("loginBtn");
const payBtn = document.getElementById("payBtn");
const statusBox = document.getElementById("status");
const dashboard = document.getElementById("dashboard");
const usernameDisplay = document.getElementById("usernameDisplay");
const txList = document.getElementById("txList");
const balanceDisplay = document.getElementById("balance");

// Utilities
const rechargeNumber = document.getElementById("rechargeNumber");
const rechargeAmount = document.getElementById("rechargeAmount");
const rechargeBtn = document.getElementById("rechargeBtn");

const billAccount = document.getElementById("billAccount");
const billAmount = document.getElementById("billAmount");
const billBtn = document.getElementById("billBtn");

const walletId = document.getElementById("walletId");
const sendPiAmount = document.getElementById("sendPiAmount");
const sendPiBtn = document.getElementById("sendPiBtn");

const feedbackInput = document.getElementById("userFeedback");
const submitFeedback = document.getElementById("submitFeedback");
const feedbackStatus = document.getElementById("feedbackStatus");

const supportEmail = document.getElementById("supportEmail");
const supportMessage = document.getElementById("supportMessage");
const submitSupport = document.getElementById("submitSupport");
const supportStatus = document.getElementById("supportStatus");

// Local balance tracker
let balance = 0;
payBtn.disabled = true;

// -------- LOGIN --------
loginBtn.addEventListener("click", async () => {
  try {
    statusBox.innerText = "Opening Pi authentication...";
    const auth = await Pi.authenticate(["username", "payments"]);
    const username = auth.user.username;

    dashboard.style.display = "block";
    usernameDisplay.innerText = username;
    payBtn.disabled = false;
    statusBox.innerText = "Logged in as: " + username;

  } catch (err) {
    console.error(err);
    statusBox.innerText = "Authentication failed";
  }
});

// -------- PI PAYMENT --------
payBtn.addEventListener("click", async () => {
  statusBox.innerText = "Processing payment...";
  await Pi.createPayment({
    amount: 1,
    memo: "FinPi Test Payment",
    metadata: { service: "test-payment" }
  }, {
    onReadyForServerApproval: id => console.log("Server approval:", id),
    onReadyForServerCompletion: (id, txid) => {
      balance += 1;
      balanceDisplay.innerText = balance + " π";

      const li = document.createElement("li");
      li.innerText = "Paid 1 π — FinPi Test Payment (" + new Date().toLocaleString() + ")";
      txList.appendChild(li);

      statusBox.innerText = "Payment completed!";
    },
    onCancel: () => statusBox.innerText = "Payment cancelled",
    onError: err => statusBox.innerText = "Payment error: " + err
  });
});

// -------- MOBILE RECHARGE (SIMULATED) --------
rechargeBtn.addEventListener("click", () => {
  const num = rechargeNumber.value.trim();
  const amt = rechargeAmount.value.trim();
  if (!num || !amt) return alert("Enter phone number and amount!");
  
  const li = document.createElement("li");
  li.innerText = "Mobile Recharge: " + amt + " π → " + num + " (" + new Date().toLocaleString() + ")";
  txList.appendChild(li);
  alert("Mobile Recharge simulated: " + amt + " π to " + num);

  rechargeNumber.value = "";
  rechargeAmount.value = "";
});

// -------- BILL PAYMENT (SIMULATED) --------
billBtn.addEventListener("click", () => {
  const acct = billAccount.value.trim();
  const amt = billAmount.value.trim();
  if (!acct || !amt) return alert("Enter account number and amount!");
  
  const li = document.createElement("li");
  li.innerText = "Bill Payment: " + amt + " π → " + acct + " (" + new Date().toLocaleString() + ")";
  txList.appendChild(li);
  alert("Bill Payment simulated: " + amt + " π to " + acct);

  billAccount.value = "";
  billAmount.value = "";
});

// -------- SEND PI (SIMULATED + QR SCAN OPTION) --------
sendPiBtn.addEventListener("click", async () => {
  const wallet = walletId.value.trim();
  const amt = sendPiAmount.value.trim();
  if (!wallet || !amt) return alert("Enter wallet ID and amount!");
  
  const li = document.createElement("li");
  li.innerText = "Sent Pi: " + amt + " π → " + wallet + " (" + new Date().toLocaleString() + ")";
  txList.appendChild(li);
  alert("Send Pi simulated: " + amt + " π to " + wallet);

  walletId.value = "";
  sendPiAmount.value = "";
});

// OPTIONAL: QR SCANNER FOR SEND PI
// Pi Browser QR scan API can be integrated here in mainnet for real scanning
// e.g., Pi.scanQRCode().then(walletId => { ... });

// -------- FEEDBACK --------
submitFeedback.addEventListener("click", () => {
  const feedback = feedbackInput.value.trim();
  if (!feedback) return alert("Enter your feedback!");
  
  const li = document.createElement("li");
  li.innerText = feedback + " (" + new Date().toLocaleString() + ")";
  txList.appendChild(li);

  feedbackStatus.innerText = "Thanks for your feedback!";
  feedbackInput.value = "";
});

// -------- SUPPORT --------
submitSupport.addEventListener("click", () => {
  const email = supportEmail.value.trim();
  const msg = supportMessage.value.trim();
  if (!email || !msg) return alert("Enter email and message!");
  
  const li = document.createElement("li");
  li.innerText = "Support Request from " + email + ": " + msg + " (" + new Date().toLocaleString() + ")";
  txList.appendChild(li);

  supportStatus.innerText = "Support request submitted!";
  supportEmail.value = "";
  supportMessage.value = "";
});
