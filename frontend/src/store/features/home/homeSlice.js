import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  categories: [],
  favorites: [],
  favoriteIds: [], // array of jobIds for quick check
  loading: false,
  error: null,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setJobs: (state, action) => {
      state.items = action.payload;
    },
    upsertJob: (state, action) => {
      const job = action.payload;
      const index = state.items.findIndex((j) => j.id === job.id);
      if (index === -1) {
        state.items.unshift(job);
      } else {
        state.items[index] = job;
      }
    },
    removeJob: (state, action) => {
      const jobId = action.payload;
      state.items = state.items.filter((j) => j.id !== jobId);
      state.favoriteIds = state.favoriteIds.filter(id => id !== jobId);
      state.favorites = state.favorites.filter(f => f.jobId !== jobId);
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload;
      state.favoriteIds = action.payload.map(f => f.jobId);
    },
    addFavorite: (state, action) => {
      const favorite = action.payload;
      state.favorites.unshift(favorite);
      state.favoriteIds.push(favorite.jobId);
    },
    removeFavorite: (state, action) => {
      const favoriteId = action.payload; // This is the ID of the favorite record
      const favorite = state.favorites.find(f => f.id === favoriteId);
      if (favorite) {
        state.favoriteIds = state.favoriteIds.filter(id => id !== favorite.jobId);
        state.favorites = state.favorites.filter(f => f.id !== favoriteId);
      }
    },
  },
});

export const {
  setJobs,
  upsertJob,
  removeJob,
  setCategories,
  setFavorites,
  addFavorite,
  removeFavorite,
} = homeSlice.actions;
export default homeSlice.reducer;
