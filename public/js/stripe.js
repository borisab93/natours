import axios from 'axios';
import { showAlert } from './alerts';
//import { loadStripe } from '@stripe/stripe-js';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51Oh88aGQ3YstrbcWxbQ8VFI6GU9CdVpXYvFgu7Z8Ejb74zwxpweJhtniy8WGCxgBwtEsu8LNNiOVLdRUNVOxZQKN00NJIXrtrL'
  );
  try {
    // 1) get checkout session from API
    const session = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    // 2) create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
