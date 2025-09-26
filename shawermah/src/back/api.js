import axios from 'axios'
const API=axios.create({
    baseURL:'http://127.0.0.1:5000/api'
})

export const postregiter=(user)=>API.post('users/postuser',user)

// for admin crud

export const postNewfood=(food)=>API.post('/users/postuser',food)
export const updateNewfood=(id,foodform)=>API.put(`/updatefood/:id/${id}`,foodform)
export const deleteLastfood=(id)=>API.delete(`/deletefood/:id/${id}`)


// for order
export const postNeworder=(order)=>API.post('/post',order)
export const updateOrder=(id,order)=>API.put(`/:id/${id}`,order)
export const deleteOrder=(id)=>API.delete(`/:id/${id}`)
export const getAllOrders=()=>API.get('/')
export const getOrderById=(id)=>API.get(`/:id/${id}`)
export const getOrdersByUserId=(userId)=>API.get(`/user/:userId/${userId}`)

// from adminroutes.js
export const postFood=(food)=>API.post('/postfood',food)
export const updateFood=(id,foodform)=>API.put(`/updatefood/:id/${id}`,foodform)
export const deleteFood=(id)=>API.delete(`/deletefood/:id/${id}`)
