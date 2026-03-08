exports.handler = async (event, context) => {

  const data = JSON.parse(event.body);

  const paymentId = data.paymentId;
  const txid = data.txid;

  console.log("Completing payment:", paymentId, txid);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Payment completed",
      paymentId: paymentId,
      txid: txid
    })
  };

};
