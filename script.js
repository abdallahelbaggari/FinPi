// ✅ Initialize Pi SDK
Pi.init({ version: "2.0", sandbox: true });

// ---------------------- ELEMENTS ----------------------
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const premiumBtn = document.getElementById("premiumBtn");

const dashboard = document.getElementById("dashboard");
const username = document.getElementById("username");
const statusBox = document.getElementById("status");

// Transaction UI (optional but supported)
const txList = document.getElementById("txList");
const clearTxBtn = document.getElementById("clearTxBtn");

// ---------------------- STATE ----------------------
let points = 0;

// ---------------------- TRANSACTION STORAGE ----------------------
let transactions = JSON.parse(localStorage.getItem("txHistory")) || [];

function renderTransactions() {
  if (!txList) return;

  txList.innerHTML = "";

  if (transactions.length === 0) {
    txList.innerHTML = "<li>No transactions yet</li>";
    return;
  }

  transactions.forEach(tx => {
    const li = document.createElement("li");
    li.innerText = tx;
    txList.appendChild(li);
  });
}

function addTransaction(text) {
  const record = text + " (" + new Date().toLocaleString() + ")";
  transactions.unshift(record);

  localStorage.setItem("txHistory", JSON.stringify(transactions));
  renderTransactions();
}

// Clear history
if (clearTxBtn) {
  clearTxBtn.addEventListener("click", () => {
    transactions = [];
    localStorage.removeItem("txHistory");
    renderTransactions();
    statusBox.innerText = "Transaction history cleared!";
  });
}

// ---------------------- MATCHES ----------------------
const matches = [
  "Argentina vs Brazil - March 20",
  "France vs Germany - March 21",
  "Nigeria vs Ghana - March 22"
];

const matchList = document.getElementById("matches");

if (matchList) {
  matches.forEach(m => {
    const li = document.createElement("li");
    li.innerText = m;
    matchList.appendChild(li);
  });
}

// ---------------------- LOGIN ----------------------
loginBtn.addEventListener("click", async () => {
  try {
    statusBox.innerText = "Logging in...";

    const auth = await Pi.authenticate(["username", "payments"]);

    username.innerText = auth.user.username;

    dashboard.style.display = "block";
    loginBtn.style.display = "none";

    statusBox.innerText = "Welcome " + auth.user.username;

  } catch (err) {
    statusBox.innerText = "Login failed";
    console.error(err);
  }
});

// ---------------------- LOGOUT ----------------------
logoutBtn.addEventListener("click", () => {
  dashboard.style.display = "none";
  loginBtn.style.display = "block";

  statusBox.innerText = "Logged out";
});

// ---------------------- PREDICTION ----------------------
window.predict = function(team) {
  document.getElementById("result").innerText = "You chose: " + team;

  points += 5;

  document.getElementById("leaderboard").innerHTML =
    "<li>You - " + points + " pts</li>";

  addTransaction("🎯 Prediction: " + team);
};

// ---------------------- COMMENTS ----------------------
window.addComment = function() {
  const input = document.getElementById("commentInput");
  if (!input.value.trim()) return;

  const li = document.createElement("li");
  li.innerText = input.value;

  document.getElementById("comments").prepend(li);

  addTransaction("💬 Comment posted");
  input.value = "";
};

// ---------------------- PAYMENT (FIXED PROPERLY) ----------------------
premiumBtn.addEventListener("click", () => {

  statusBox.innerText = "Processing payment...";

  Pi.createPayment(
    {
      amount: 0.5,
      memo: "WorldCup Premium",
      metadata: { type: "premium" }
    },
    {
      // ✅ MUST WAIT FOR APPROVAL
      onReadyForServerApproval: async (paymentId) => {
        const res = await fetch("/.netlify/functions/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId })
        });

        if (!res.ok) {
          throw new Error("Approval failed");
        }
      },

      // ✅ MUST WAIT FOR COMPLETION
      onReadyForServerCompletion: async (paymentId, txid) => {
        const res = await fetch("/.netlify/functions/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid })
        });

        if (!res.ok) {
          throw new Error("Completion failed");
        }

        statusBox.innerText = "✅ Premium Unlocked!";
        addTransaction("💰 Paid 0.5π — Premium");
      },

      onCancel: () => {
        statusBox.innerText = "Payment cancelled";
      },

      onError: (err) => {
        statusBox.innerText = "Payment error";
        console.error(err);
      }
    }
  );
});

// ---------------------- INIT ----------------------
renderTransactions();
