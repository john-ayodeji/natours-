import axios from 'axios';
import { showAlert } from './alerts';

export const updateUser = async (data, type) => {
    try{
        const url = type === 'password' 
        ? '/api/v1/users/updatemypassword' 
        : '/api/v1/users/updateMe';

        const res = await axios({
            method: 'PATCH',
            url,
            data
        })

        if(res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`);
            window.setTimeout(() => {
                location.assign('/me')
            }, 1500)
        }

    } catch (err) {
        showAlert('error', err.response.data.message);
    }  
}