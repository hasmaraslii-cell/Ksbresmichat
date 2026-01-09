import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "ksb-op.firebaseapp.com",
  databaseURL: "https://ksb-op-default-rtdb.firebaseio.com",
  projectId: "ksb-op",
  storageBucket: "ksb-op.appspot.com",
  messagingSenderId: "000",
  appId: "1:000:web:000"
};

export const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
