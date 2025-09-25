import axios from 'axios'
const API=axios.create({
    baseURL:'http://127.0.0.1:5000/api'
})

export const postregiter=(user)=>API.post('users/postuser',user)

// for admin crud

export const postNewfood=(food)=>API.post('/users/postuser',food)
export const updateNewfood=(id,foodform)=>API.put(`/updatefood/:id/${id}`,foodform)
export const deleteLastfood=(id)=>API.delete(`/deletefood/:id/${id}`)
