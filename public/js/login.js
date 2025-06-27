import axios from 'axios'
import { showAlert } from './alerts'

export const signup = async (name, email, password, passwordConfirm) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        })

        if(res.data.status === 'success') {
           showAlert('success', 'SignUp Succesfull');
            window.setTimeout(() => {
                location.assign('/me')
            }, 1500)
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

export const forgotPassword = async (email) => {
    try{
    const res = await axios({
        method: 'POST',
        url: 'http://127.0.0.1:3000/api/v1/users/forgotpassword',
        data: {
            email
        }
    })

        if(res.data.status === 'success') {
            showAlert('success', 'Password reset link has been sent to your email, please finish process through the provided link');
            window.setTimeout(() => {
                location.assign('/')
            }, 1500)
        }
    } catch (err) {
        showAlert('error', err.response.data.message)
    }
}

export const resetPassword = async (password, passwordConfirm) => {
    const tokenArr = window.location.pathname.split('/');
    const resetToken = tokenArr[tokenArr.length - 1];
    console.log(resetToken)
    try {
        const res = await axios({
            method: 'PATCH',
            url: `http://127.0.0.1:3000/api/v1/users/resetPassword/${resetToken}`,
            data: {
                password,
                passwordConfirm
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Password changed, you can now login in with your new password');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

export const login = async (email, password) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        })

        if(res.data.status === 'success') {
            showAlert('success', 'Logged in succesfully');
            window.setTimeout(() => {
                location.assign('/')
            }, 1500)
        }

    } catch (err) {
        showAlert('error', err.response.data.message);
    }  
}

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout'
        });

        if(res.data.status === 'success') location.reload(true);
    } catch (err) {
        showAlert('error', 'Error logging out! Try again later')
    }
}