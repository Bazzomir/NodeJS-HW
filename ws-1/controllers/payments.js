const paypal = require('@paypal/checkout-server-sdk');
const client = require('../utilities/paypal/client');

module.exports = {
  create: async (req, res) => {
    let request = new paypal.orders.OrdersCreateRequest();
    request.headers["prefer"] = "return=representation";
    request.requestBody({
      "intent": "AUTHORIZE",
      "purchase_units": [
        {
          "amount": {
            "currency_code": req.body.currency_code,
            "value": req.body.amount
          }
        }
      ]
    });

    let response = await client.execute(request);

    // console.log(request);
    // console.log(response);

    let approveLink = '';
    response.result.links.every(link => {
      if (link.rel == 'approve') {
        approveLink = link.href;
        return false;
      }

      return true;
    });

    res.status(response.statusCode)
      .send({
        order_id: response.result.id,
        approve_link: approveLink
      })
  },
  authorize: async (req, res) => {
    const request = new paypal.orders.OrdersAuthorizeRequest(req.body.order_id);
    request.requestBody({});
    
    let response = await client.execute(request);

    console.log(request);
    console.log(response);

    res.status(response.statusCode)
      .send({
        authorization_id: response.result.purchase_units[0].payments.authorizations[0].id
      })
  },
  capture: async (req, res) => {
    const request = new paypal.orders.AuthorizeCaptureRequest(req.body.authorize_id);
    request.requestBody({});

    let response = await client.execute(request);

    console.log(request);
    console.log(response);

    res.status(response.statusCode)
      .send({
        authorization_id: response.result.purchase_units[0].payments.authorizations[0].id
      })
  },
  refund: async (req, res) => {
    const request = new paypal.orders.AuthorizeRefundRequest(req.body.order_id);
    request.requestBody({});

    let response = await client.execute(request);

    console.log(request);
    console.log(response);

    res.status(response.statusCode)
      .send({
        authorization_id: response.result.purchase_units[0].payments.authorizations[0].id
      })
  },
};
