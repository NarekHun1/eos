require('dotenv').config();

import {API_ACCOUNT_NAME, API_URL} from "./constants";
import axios from 'axios';
import mongoose from 'mongoose';
import Action from './models/Action';

const MONGO_URI = process.env.MONGO_URI || '';
const CRON_EXEC_SEC = Number(process.env.CRON_EXEC_SEC) || 6000;

const fetchActions = async () => {
  try {
    const response = await axios.post(API_URL, {
      account_name: API_ACCOUNT_NAME,
      pos: -1,
      offset: -100
    });

    return response.data.actions.map((action: any) => ({
      trx_id: action.action_trace.trx_id,
      block_time: action.action_trace.block_time,
      block_num: action.action_trace.block_num
    }));
  } catch (error) {
    console.error('Error fetching actions:', error);
    return [];
  }
};

const saveActionToDB = async (actions: any[]) => {
  for (const action of actions) {
    try {
      await Action.create(action);
      console.log(`Inserted trx_id: ${action.trx_id}`);
    } catch (error) {
      if ((error as any).code === 11000) {
        console.log(`Duplicate trx_id: ${action.trx_id}`);
      } else {
        console.error('Error inserting action:', error);
      }
    }
  }
};

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    setInterval(async () => {
      const actions = await fetchActions();
      if (actions.length) {
        await saveActionToDB(actions);
      }
    }, CRON_EXEC_SEC * 1000);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

start();

