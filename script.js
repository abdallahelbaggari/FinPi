// ✅ Initialize Pi SDK
Pi.init({ version: "2.0", sandbox: true });

// ---------------------- ELEMENTS ----------------------
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const premiumBtn = document.getElementById("premiumBtn");
const statusBox = document.getElementById("status");
const dashboard = document.getElementById("dashboard");
const usernameDisplay = document.getElementById("username");

const txList = document.getElementById("txList");
const clearTxBtn = document.getElementById("clearTxBtn");

// ---------------------- STATE ----------------------
let points = 0;
let transactions = JSON.parse(localStorage.getItem("txHistory")) || [];

// ---------------------- TRANSACTION SYSTEM ----------------------
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
  const record = `${text} (${new Date().toLocaleString()})`;
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
    statusBox.innerText = "Transaction history cleared";
  });
}

// Initial render
renderTransactions();

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
    statusBox.innerText = "Opening Pi authentication...";

    const auth = await Pi.authenticate(["username", "payments"]);

    usernameDisplay.innerText = auth.user.username;

    dashboard.style.display = "block";
    loginBtn.style.display = "none";

    statusBox.innerText = `Logged in as: ${auth.user.username}`;

  } catch (err) {
    statusBox.innerText = "Authentication failed";
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
function predict(team) {
  document.getElementById("result").innerText = `You chose: ${team}`;

  points += 5;

  document.getElementById("leaderboard").innerHTML =
    `<li>You - ${points} pts</li>`;

  addTransaction(`🎯 Prediction: ${team}`);
}

// ---------------------- STAKING ----------------------
document.getElementById("stakeBtn").addEventListener("click", () => {
  const stake = parseInt(document.getElementById("stakeAmount").value);

  if (!stake || stake <= 0) return alert("Enter valid points");
  if (stake > points) return alert("Not enough points");

  const reward = Math.floor(Math.random() * 10);

  points = points - stake + reward;

  document.getElementById("leaderboard").innerHTML =
    `<li>You - ${points} pts</li>`;

  document.getElementById("stakeStatus").innerText =
    `You earned +${reward} pts`;

  addTransaction(`📈 Staked ${stake} pts → +${reward}`);
});

// ---------------------- COMMENTS ----------------------
function addComment() {
  const input = document.getElementById("commentInput");

  if (!input.value.trim()) return;

  const li = document.createElement("li");
  li.innerText = input.value;

  document.getElementById("comments").prepend(li);

  addTransaction("💬 Comment posted");

  input.value = "";
}

// ---------------------- PAYMENT (UNCHANGED CORE ✅) ----------------------
premiumBtn.addEventListener("click", () => {

  statusBox.innerText = "Processing payment...";

  Pi.createPayment(
    {
      amount: 0.5,
      memo: "WorldCup Premium",
      metadata: { type: "premium" }
    },
    {
      // ✅ MUST RETURN (VERY IMPORTANT)
      onReadyForServerApproval: (paymentId) => {
        return fetch("/.netlify/functions/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId })
        });
      },

      // ✅ MUST RETURN (VERY IMPORTANT)
      onReadyForServerCompletion: (paymentId, txid) => {
        return fetch("/.netlify/functions/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid })
        }).then(() => {

          statusBox.innerText = "✅ Premium Unlocked!";

          addTransaction("💰 Paid 0.5π — Premium");

        });
      },

      onCancel: () => {
        statusBox.innerText = "Payment cancelled";
      },

      onError: (err) => {
        statusBox.innerText = "Payment error: " + err;
        console.error(err);
      }
    }
  );

});
