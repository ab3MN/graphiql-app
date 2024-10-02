import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCUe2O6-xbll1s-melLfLjpKNeGdmLt7vs',
  authDomain: 'graphiql-app-3427b.firebaseapp.com',
  projectId: 'graphiql-app-3427b',
  storageBucket: 'graphiql-app-3427b.appspot.com',
  messagingSenderId: '264288870296',
  appId: '1:264288870296:web:a3cc5f68f35cb2572ad5ed',
  measurementId: 'G-6PQCX123BH',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, db };
