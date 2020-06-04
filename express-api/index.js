const express = require('express')
const app = express()
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 3000

const stripe = require('stripe')('API_KEY: sk_test');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors())

app.post('/pay', async(req, res) => {
    const { email } = req.body;
    // console.log(email);
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 5000,
        currency: 'clp',
        // Verify your integration in this guide by including this parameter
        metadata: { integration_check: 'accept_a_payment' },
        receipt_email: email,
    });
    res.json({ 'client_secret': paymentIntent['client_secret'] })
});

app.post('/suscripcion', async(req, res) => {

    const { email, payment_method } = req.body;
    // console.log(payment_method);

    // Create a new customer object
    const customer = await stripe.customers.create({
        payment_method: payment_method,
        email: email,
        invoice_settings: {
            default_payment_method: payment_method,
        },
    });

    // Recommendation: save the customer.id in your database.
    // res.send({ customer });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: 'price_1GqCpIFkOCEoTTiaEG5vqJ2C' }],
        expand: ['latest_invoice.payment_intent'],
    });

    const status = subscription['latest_invoice']['payment_intent']['status'];
    const client_secret = subscription['latest_invoice']['payment_intent']['client_secret'];

    res.json({ 'client_secret': client_secret, 'status': status })
});

app.listen(port, () => console.log(`Server corriendo sobre el port ${port}!`))