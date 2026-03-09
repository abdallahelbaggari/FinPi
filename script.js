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

// Disable payment until login
payBtn.disabled = true;


// Login with Pi
loginBtn.addEventListener("click", async () => {

  try {

    statusBox.innerText = "Opening Pi authentication...";

    const scopes = ["username", "payments"];

    const auth = await Pi.authenticate(scopes, function(payment) {
      console.log("Incomplete payment found:", payment);
    });

    const username = auth.user.username;

    // Show dashboard
    dashboard.style.display = "block";
    usernameDisplay.innerText = "Logged in as: " + username;

    // Hide login button
    loginBtn.style.display = "none";

    statusBox.innerText = "Authentication successful";

    // Enable payment button
    payBtn.disabled = false;

  } catch (error) {

    console.error(error);
    statusBox.innerText = "Authentication failed";

  }

});


// Payment creation
payBtn.addEventListener("click", () => {

  statusBox.innerText = "Creating payment...";

  Pi.createPayment({

    amount: 1,
    memo: "FinPi Test Payment",
    metadata: { service: "test-payment" }

  }, {

    // Step 1 — Payment ready for backend approval
    onReadyForServerApproval: function(paymentId) {

      statusBox.innerText = "Waiting for server approval...";

      fetch("/.netlify/functions/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ paymentId: paymentId })
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


    // Step 2 — Payment ready for completion
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

      })
      .catch(err => {

        console.error(err);
        statusBox.innerText = "Completion failed";

      });

    },


    // User cancels payment
    onCancel: function(paymentId) {

      console.log("Payment cancelled:", paymentId);
      statusBox.innerText = "Payment cancelled";

    },


    // Error during payment
    onError: function(error, payment) {

      console.error("Payment error:", error);
      statusBox.innerText = "Payment error occurred";

    }

  });

});
