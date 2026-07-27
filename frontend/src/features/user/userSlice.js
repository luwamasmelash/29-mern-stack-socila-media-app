import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'

const initialState = {
    value: null,
    loading: true,
    error: null
}

export const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async (token, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/api/user/data', {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            })

            return data.success ? data.user : null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const updateUser = createAsyncThunk(
    'user/update',
    async ({ userData, token }) => {
        const { data } = await api.post('/api/user/update', userData, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (data.success) {
            toast.success(data.message)
            return data.user
        } else {
            toast.error(data.message)
            return null
        }
    }
)

const userSlice = createSlice({
    name: 'user',
    initialState,

    reducers: {},

    extraReducers: (builder) => {
    builder
        .addCase(fetchUser.pending, (state) => {
            state.loading = true
        })

        .addCase(fetchUser.fulfilled, (state, action) => {
            console.log("Redux user received:", action.payload)

            state.value = action.payload
            state.loading = false
            state.error = null
        })

        .addCase(fetchUser.rejected, (state, action) => {
            console.log("Fetch user failed:", action.payload)

            state.loading = false
            state.value = null
            state.error = action.payload
        })

        .addCase(updateUser.fulfilled, (state, action) => {
            state.value = action.payload
        })
}
})

export default userSlice.reducer