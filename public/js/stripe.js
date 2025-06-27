import axios from 'axios'
import { showAlert } from './alerts';

const stripe = Stripe('pk_test_51RWeTIGGSPrhNowK7NDtvggds4rKKlzMrP2LSDZhvWnwH6OLsQT7agE3IcMNPKq5qMqXoLtakFKRVcK6DjmJTg1E00fgbuNma4');

export const bookTour =  async tourId => {
    try{
        //1) get checkout session from server
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)
        console.log(session);

        //2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })

    } catch (err) {
        console.log(err)
        showAlert('error', err)
    }
}