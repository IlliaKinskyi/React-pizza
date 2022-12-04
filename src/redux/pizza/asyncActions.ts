import { Pizza, SearchPizzaParams } from "./types";
import axios from 'axios';
import { createAsyncThunk } from "@reduxjs/toolkit";


export const fetchPizzas = createAsyncThunk<Pizza[], SearchPizzaParams>('pizza/fetchPizzasStatus', async (params) => {
    const { order, sortBy, category, search, currentPage } = params;
    const { data } = await axios.get<Pizza[]>(
      `https://633db4ae7e19b17829148831.mockapi.io/items?page=${currentPage}&limit=8&${category}&sortBy=${sortBy}&order=${order}${search}`,
    );
    return data;
  });
  