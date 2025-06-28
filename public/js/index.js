import { login, logout, signup, forgotPassword, resetPassword } from './login';
import { displayMap } from './mapbox';
import{ updateUser } from './updateSettings';
import { bookTour } from './stripe';
import '@babel/polyfill'

//DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login')
const signupForm = document.querySelector('.form--signup')
const forgotPasswordForm = document.querySelector('.form--forgot')
const logOutBtn = document.querySelector('.nav__el--logout')
const detailsForm = document.querySelector('.form-user-data')
const passwordForm = document.querySelector('.form-user-settings')
const bookBtn = document.getElementById('book-tour')
const resetForm = document.querySelector('.form--reset-password');

//delegation
if(mapBox) {
    const locations = JSON.parse(document.getElementById('map').dataset.locations);
    displayMap(locations)
}

if (loginForm)
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    })

if (signupForm)
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signup(name, email, password, passwordConfirm);
    })

if (forgotPasswordForm)
    forgotPasswordForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        forgotPassword(email);
    })

if (resetForm) {
  resetForm.addEventListener('submit', e => {
    e.preventDefault();
    const password = document.getElementById('password').value
    const passwordConfirm = document.getElementById('passwordConfirm').value
    resetPassword(password, passwordConfirm)
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout)

if (detailsForm) 
    detailsForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

        updateUser(form, 'data');
    })

if (passwordForm) 
    passwordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').innerHTML = 'Updating...'
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateUser({passwordCurrent, password, passwordConfirm}, 'password');

        document.querySelector('.btn--save-password').innerHTML = 'Update Password'
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    })

if(bookBtn)
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'processing...';
        const { tourId } = e.target.dataset;
        bookTour(tourId);
})

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20)