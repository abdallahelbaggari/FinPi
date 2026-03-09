// Initialize Pi SDK
Pi.init({
  version: "2.0",
  sandbox: true
});

// Elements
const loginBtn = document.getElementById("loginBtn");
const payBtn = document.getElementById("payBtn");
const statusBox = document.getElementById("status");

const dashboard = document.getElementById("dashboard");
const usernameDisplay = document.getElementById("usernameDisplay");

const transactions = document.getElementById("transactions");
const txList = document.getElementById("txList");

const balanceDisplay = document.getElementById("balance");

// Local balance tracker
let balance = 0;

// Disable payment until login
payBtn.disabled = true;


// LOGIN WITH PI
loginBtn.addEventListener("click", async () => {

  try {

    statusBox.innerText = "Opening Pi authentication...";

    const scopes = ["username", "payments"];

    const auth = await Pi.authenticate(scopes, function(payment) {
      console.log("Incomplete payment found:", payment);
    });

    const username = auth.user.username;

    statusBox.innerText = "Logged in as: " + username;

    // Show dashboard
    dashboard.style.display = "block";

    usernameDisplay.innerText = "Hello, " + username;

    transactions.style.display = "block";

    // Enable payment button
    payBtn.disabled = false;

  } catch (error) {

    console.error(error);

    statusBox.innerText = "Authentication failed";

  }

});


// CREATE PAYMENT
payBtn.addEventListener("click", () => {

  statusBox.innerText = "Creating payment...";

  Pi.createPayment({

    amount: 1,
    memo: "FinPi Test Payment",
    metadata: { service: "test-payment" }

  }, {

    // STEP 1: WAITING FOR SERVER APPROVAL
    onReadyForServerApproval: function(paymentId) {

      statusBox.innerText = "Waiting for server approval...";

      fetch("/.netlify/functions/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paymentId: paymentId
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log("Approval response:", data);
      })
      .catch(err => {

        console.error(err);

        statusBox.innerText = "Server approval failed";

      });

    },


    // STEP 2: COMPLETE PAYMENT
    onReadyForServerCompletion: function(paymentId, txid) {

      statusBox.innerText = "Completing payment...";

      fetch("/.netlify/functions/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paymentId: paymentId,
          txid: txid
        })
      })
      .then(res => res.json())
      .then(data => {

        console.log("Completion response:", data);

        statusBox.innerText = "Payment completed successfully";

        // UPDATE BALANCE
        balance += 1;

        balanceDisplay.innerText = balance + " π";

        // ADD TRANSACTION
        const item = document.createElement("li");

        const date = new Date().toLocaleString();

        item.innerText = "Paid 1 π — FinPi Test Payment (" + date + ")";

        txList.appendChild(item);

      })
      .catch(err => {

        console.error(err);

        statusBox.innerText = "Completion failed";

      });

    },


    // USER CANCELS PAYMENT
    onCancel: function(paymentId) {

      console.log("Payment cancelled:", paymentId);

      statusBox.innerText = "Payment cancelled";

    },


    // PAYMENT ERROR
    onError: function(error, payment) {

      console.error("Payment error:", error);

      statusBox.innerText = "Payment error occurred";

    }

  });

});
