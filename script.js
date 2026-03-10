// Initialize Pi SDK (TESTNET)
Pi.init({ version: "2.0", sandbox: true });

// Elements
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

// Local balance
let balance = 0;
payBtn.disabled = true;


// LOGIN
loginBtn.addEventListener("click", async () => {

  try {

    statusBox.innerText = "Opening Pi authentication...";

    const auth = await Pi.authenticate(["username","payments"]);

    const username = auth.user.username;

    dashboard.style.display = "block";
    usernameDisplay.innerText = username;

    payBtn.disabled = false;

    statusBox.innerText = "Logged in as " + username;

  } catch(error) {

    console.error(error);

    statusBox.innerText = "Authentication failed";

  }

});


// PAYMENT
payBtn.addEventListener("click", () => {

  statusBox.innerText = "Processing payment...";

  Pi.createPayment({

    amount: 1,
    memo: "FinPi Test Payment",
    metadata: { service: "FinPi Payment" }

  }, {

    onReadyForServerApproval: paymentId => {

      fetch("/.netlify/functions/approve",{

        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ paymentId })

      })
      .then(res => res.json())
      .then(data => console.log("Approved",data))
      .catch(err => console.log(err));

    },

    onReadyForServerCompletion:(paymentId,txid)=>{

      fetch("/.netlify/functions/complete",{

        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ paymentId,txid })

      })
      .then(res => res.json())
      .then(()=>{

        balance += 1;

        balanceDisplay.innerText = balance + " π";

        const li = document.createElement("li");

        li.innerText =
        "Paid 1 π — FinPi Service (" +
        new Date().toLocaleString() + ")";

        txList.appendChild(li);

        statusBox.innerText = "Payment completed";

      });

    },

    onCancel:()=>{

      statusBox.innerText = "Payment cancelled";

    },

    onError:error=>{

      statusBox.innerText = "Payment error";

      console.error(error);

    }

  });

});


// MOBILE RECHARGE
rechargeBtn.addEventListener("click",()=>{

  const num = rechargeNumber.value.trim();
  const amt = rechargeAmount.value.trim();

  if(!num || !amt){
    alert("Enter phone number and amount");
    return;
  }

  const li = document.createElement("li");

  li.innerText =
  "Recharge " + amt + " π → " + num +
  " (" + new Date().toLocaleString() + ")";

  txList.appendChild(li);

  rechargeNumber.value="";
  rechargeAmount.value="";

});


// BILL PAYMENT
billBtn.addEventListener("click",()=>{

  const acct = billAccount.value.trim();
  const amt = billAmount.value.trim();

  if(!acct || !amt){
    alert("Enter account number and amount");
    return;
  }

  const li = document.createElement("li");

  li.innerText =
  "Bill Payment " + amt + " π → " + acct +
  " (" + new Date().toLocaleString() + ")";

  txList.appendChild(li);

  billAccount.value="";
  billAmount.value="";

});


// SEND PI
sendPiBtn.addEventListener("click",()=>{

  const wallet = walletId.value.trim();
  const amt = sendPiAmount.value.trim();

  if(!wallet || !amt){
    alert("Enter wallet and amount");
    return;
  }

  const li = document.createElement("li");

  li.innerText =
  "Sent " + amt + " π → " + wallet +
  " (" + new Date().toLocaleString() + ")";

  txList.appendChild(li);

  walletId.value="";
  sendPiAmount.value="";

});


// FEEDBACK
submitFeedback.addEventListener("click",()=>{

  const feedback = feedbackInput.value.trim();

  if(!feedback){
    alert("Enter feedback");
    return;
  }

  feedbackStatus.innerText="Feedback received";

  feedbackInput.value="";

});


// SUPPORT
submitSupport.addEventListener("click",()=>{

  const email = supportEmail.value.trim();
  const msg = supportMessage.value.trim();

  if(!email || !msg){
    alert("Enter email and message");
    return;
  }

  supportStatus.innerText="Support request submitted";

  supportEmail.value="";
  supportMessage.value="";

});
