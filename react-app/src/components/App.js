import React from 'react';
// Components
import HomePage from './HomePage';

// STRIPE
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

// Styles
import '../index.scss';

const stripePromise = loadStripe("API_KEY: pk_test");

function App() {
  return (
    <Elements stripe={stripePromise}>
      <HomePage />
    </Elements>
  );
}

export default App;
