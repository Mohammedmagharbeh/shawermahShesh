import axios from 'axios'
const API=axios.create({
    baseURL:'http://127.0.0.1:5000/api'
})

export const postregiter=(user)=>API.post('users/postuser',user)