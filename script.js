// Initialize Pi SDK
Pi.init({ version: "2.0", sandbox: true });

// ---------------------- ELEMENTS ----------------------
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const payBtn = document.getElementById("payBtn");
const statusBox = document.getElementById("status");
const dashboard = document.getElementById("dashboard");
const usernameDisplay = document.getElementById("usernameDisplay");
const balanceDisplay = document.getElementById("balance");
const txList = document.getElementById("txList");
const refreshBalance = document.getElementById("refreshBalance");
const clearTxBtn = document.getElementById("clearTxBtn");

// Utilities
const rechargeNumber = document.getElementById("rechargeNumber");
const rechargeAmount = document.getElementById("rechargeAmount");
const billAccount = document.getElementById("billAccount");
const billAmount = document.getElementById("billAmount");
const walletId = document.getElementById("walletId");
const sendPiAmount = document.getElementById("sendPiAmount");

// Feedback & Support
const feedbackInput = document.getElementById("userFeedback");
const feedbackStatus = document.getElementById("feedbackStatus");
const supportEmail = document.getElementById("supportEmail");
const supportMessage = document.getElementById("supportMessage");
const supportStatus = document.getElementById("supportStatus");

// QR Payment
const qrAmount = document.getElementById("qrAmount");
const qrMemo = document.getElementById("qrMemo");
const qrCodeDiv = document.getElementById("qrCode");

// Wallet & Transaction
let balance = 0;

// ---------------------- LOGIN & LOGOUT ----------------------
loginBtn.addEventListener("click", async () => {
    try {
        statusBox.innerText = "Opening Pi authentication...";
        const auth = await Pi.authenticate(["username","payments"]);
        usernameDisplay.innerText = auth.user.username;
        dashboard.style.display = "block";
        loginBtn.style.display = "none";
        payBtn.disabled = false;
        statusBox.innerText = `Logged in as: ${auth.user.username}`;
    } catch(err) {
        statusBox.innerText = "Authentication failed";
        console.error(err);
    }
});

logoutBtn.addEventListener("click", () => {
    dashboard.style.display = "none";
    loginBtn.style.display = "block";
    balance = 0;
    balanceDisplay.innerText = "0 π";
    txList.innerHTML = "<li>No transactions yet</li>";
    statusBox.innerText = "Logged out. Open FinPi in Pi Browser to continue.";
});

// ---------------------- WALLET & BALANCE ----------------------
refreshBalance.addEventListener("click", () => {
    balanceDisplay.innerText = `${balance} π`;
    statusBox.innerText = "Balance refreshed!";
});

// ---------------------- TRANSACTIONS HELPER ----------------------
function addTransaction(icon, text) {
    // Remove "No transactions yet" if first transaction
    if (txList.children.length === 0 || txList.children[0].innerText === "No transactions yet") {
        txList.innerHTML = "";
    }
    const li = document.createElement("li");
    li.innerHTML = `${icon} ${text} (${new Date().toLocaleString()})`;
    txList.prepend(li);
}

// Clear transaction history
clearTxBtn.addEventListener("click", () => {
    txList.innerHTML = "<li>No transactions yet</li>";
    statusBox.innerText = "Transaction history cleared!";
});

// ---------------------- PAYMENTS ----------------------
payBtn.addEventListener("click", () => {
    statusBox.innerHTML = "<span class='loading'></span> Processing payment...";
    Pi.createPayment({
        amount: 1,
        memo: "FinPi Test Payment",
        metadata: { service: "test-payment" }
    },{
        onReadyForServerApproval: paymentId => {
            fetch("/.netlify/functions/approve", {
                method:"POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({paymentId})
            });
        },
        onReadyForServerCompletion: (paymentId, txid) => {
            fetch("/.netlify/functions/complete", {
                method:"POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({paymentId, txid})
            }).then(() => {
                balance += 1;
                balanceDisplay.innerText = `${balance} π`;
                addTransaction("💸", "Paid 1 π — FinPi Test Payment");
                statusBox.innerText = "Payment completed!";
            });
        },
        onCancel: () => { statusBox.innerText = "Payment cancelled"; },
        onError: err => { statusBox.innerText = "Payment error: " + err; console.error(err); }
    });
});

// ---------------------- MOBILE RECHARGE ----------------------
document.getElementById("rechargeBtn").addEventListener("click", () => {
    const num = rechargeNumber.value.trim();
    const amt = rechargeAmount.value.trim();
    if(!num || !amt) return alert("Enter phone number and amount!");
    addTransaction("📱", `${amt} π → ${num}`);
    rechargeNumber.value = "";
    rechargeAmount.value = "";
    statusBox.innerText = "Mobile Recharge simulated!";
});

// ---------------------- BILL PAYMENT ----------------------
document.getElementById("billBtn").addEventListener("click", () => {
    const acct = billAccount.value.trim();
    const amt = billAmount.value.trim();
    if(!acct || !amt) return alert("Enter account number and amount!");
    addTransaction("💡", `${amt} π → ${acct}`);
    billAccount.value = "";
    billAmount.value = "";
    statusBox.innerText = "Bill Payment simulated!";
});

// ---------------------- SEND PI ----------------------
document.getElementById("sendPiBtn").addEventListener("click", () => {
    const wallet = walletId.value.trim();
    const amt = sendPiAmount.value.trim();
    if(!wallet || !amt) return alert("Enter wallet ID and amount!");
    addTransaction("🔗", `${amt} π → ${wallet}`);
    walletId.value = "";
    sendPiAmount.value = "";
    statusBox.innerText = "Send Pi simulated!";
});

// ---------------------- FEEDBACK ----------------------
document.getElementById("submitFeedback").addEventListener("click", () => {
    const feedback = feedbackInput.value.trim();
    if(!feedback) return alert("Enter your feedback!");
    addTransaction("📝", feedback);
    feedbackInput.value = "";
    feedbackStatus.innerText = "Thanks for your feedback!";
});

// ---------------------- SUPPORT ----------------------
document.getElementById("submitSupport").addEventListener("click", () => {
    const email = supportEmail.value.trim();
    const msg = supportMessage.value.trim();
    if(!email || !msg) return alert("Enter email and message!");
    addTransaction("🛠️", `Support from ${email}: ${msg}`);
    supportEmail.value = "";
    supportMessage.value = "";
    supportStatus.innerText = "Support request submitted!";
});

// ---------------------- QR PAYMENT ----------------------
document.getElementById("generateQRBtn").addEventListener("click", () => {
    const amt = qrAmount.value.trim();
    const memo = qrMemo.value.trim();
    if(!amt) return alert("Enter amount!");
    const qrString = `pi://payment?amount=${amt}&memo=${encodeURIComponent(memo)}`;
    qrCodeDiv.innerHTML = ""; // Clear old QR
    QRCode.toCanvas(qrCodeDiv, qrString, {width:200}, function(err){
        if(err) console.error(err);
    });
    statusBox.innerText = "QR Code generated!";
});
