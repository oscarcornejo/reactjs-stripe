import React, {useState} from 'react';
import axios from 'axios';
// MUI Components
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';

//STRIPE
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';

// Util imports
import {makeStyles} from '@material-ui/core/styles';

// COMPONENTES
import CardInput from './CardInput';

const useStyles = makeStyles({
  root: {
    maxWidth: 500,
    margin: '35vh auto',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'flex-start',
  },
  div: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'flex-start',
    justifyContent: 'space-between',
  },
  button: {
    margin: '2em auto 1em',
  },
});

function HomePage() {
  const classes = useStyles();
  // State
  const [email, setEmail] = useState('');

  const stripe = useStripe();
  const elements = useElements();

  const handleSubmitPay = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    // try {} catch (error) {}

    const res = await axios.post('http://localhost:3000/pay', {email: email});
    console.log('res:: ', res.data);

    const clientSecret = res.data["client_secret"];
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          email: email,
        },
      }
    });

    if (result.error) {
      // Show error to your customer (e.g., insufficient funds)
      console.log(result.error.message);
    } else {
      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {
        console.log('El Dinero ya está en el Banco!');
        // Show a success message to your customer
        // There's a risk of the customer closing the window before callback
        // execution. Set up a webhook or plugin to listen for the
        // payment_intent.succeeded event that handles any business critical
        // post-payment actions.
      }
    }
  };

  const handleSubmitSub = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
    
    const result = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          email: email,
        },
      });

      console.log('result: ', result);

      if (result.error) {
        console.log('ERROR: ', result.error.message);
      } else {
        const res = await axios.post('http://localhost:3000/suscripcion', {payment_method: result.paymentMethod.id, email: email});
        console.log('data:: ', res.data);
        
        const {client_secret, status} = res.data;

        // console.log('client_secret: ', client_secret);
        // console.log('status: ', status);
  
        if (status === 'requires_action') {
          stripe.confirmCardPayment(client_secret).then(function(result) {
            if (result.error) {
              console.log('¡Hubo un problema!');
              console.log(result.error);
              // Display error message in your UI.
              // The card was declined (i.e. insufficient funds, card has expired, etc)
            } else {
              console.log('¡Ya tienes el dinero!');
              // Show a success message to your customer
            }
          });
        } else {
          console.log('¡Ya tienes el dinero!');
          // No additional information was needed
          // Show a success message to your customer
        }
      }
  }


  return (
    <Card className={classes.root}>
      <CardContent className={classes.content}>
        <TextField
          label='Email'
          id='outlined-email-input'
          helperText={`*Correo electrónico en el que recibirá actualizaciones y recibos.`}
          margin='normal'
          variant='outlined'
          type='email'
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <CardInput />
        <div className={classes.div}>
          <Button variant="contained" color="primary" className={classes.button} onClick={handleSubmitPay}>
            Pagar
          </Button>
          <Button variant="contained" color="primary" className={classes.button} onClick={handleSubmitSub}>
            Suscripción
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default HomePage;
