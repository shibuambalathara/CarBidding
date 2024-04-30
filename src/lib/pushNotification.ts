//  import * as admin from 'firebase-admin';
//  interface ServiceAccount {
//     type: string;
//     project_id: string;
  

//     private_key_id: string;
//     private_key: string;
//     client_email: string;
//     client_id: string;
//     auth_uri: string;
//     token_uri: string;
//     auth_provider_x509_cert_url: string;
//     client_x509_cert_url: string;
//     universe_domain: string;
//  }
//   import { initializeApp } from 'firebase-admin/app';
//  const app = initializeApp();
//  const myRefreshToken = '...'; // Get refresh token from OAuth2 flow
//  const serviceAccount: ServiceAccount = require('../lib/autobse-push-notification-firebase-adminsdk-zdmde-3fb12d5d57.json');

//  // Initialize Firebase Admin SDK
//  admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
 
//  admin.initializeApp({
//      credential: admin.credential.cert({
//        projectId: serviceAccount.project_id,
//        clientEmail: serviceAccount.client_email,
//        privateKey: serviceAccount.private_key,
//      }),
//     databaseURL: 'https://autobse-push-notification.firebaseio.com',
//    });

//   const registrationToken = 'your-device-registration-token';

// const message = {
//   notification: {
//     title: 'Hello',
//     body: 'World',
//   },
//   token: registrationToken,
// };

// admin.messaging().send(message)
//   .then((response) => {
//     console.log('Successfully sent message:', response);
//   })
//   .catch((error) => {
//     console.error('Error sending message:', error);
//   });

// import * as cron from 'node-cron'
// cron.schedule('*/10 * * * *', async () => {
  

//   try {
   
//     console.log('Cron job executed successfully');
//   } catch (error) {
//     console.error('Error executing cron job:', error);
//   }
// });
// This registration token comes from the client FCM SDKs.


import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
const serviceAccount = require('../lib/autobse-push-notification-firebase-adminsdk-zdmde-3fb12d5d57.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId:process.env.project_id
});
const messaging = admin.messaging()
    var payload = {
        notification: {
            title: "This is a Notification",
            body: "This is the body of the notification message."
        },
        topic: 'topic',
        token:"Fe26.2**6934d78c6b85aa4e8d682f349a730d5f0149a1b8b846fd77f12cff4fe47f832d*Fa6wF3kd5S_iPaZPxJ0F1g*QpJMnKt709j1SCEmnFu8ZfYyYpkEO3JYejODLfzeEyM540qrm8J3B4v_0yYPo4XpjXOFL1bOXPjqdVYLdfdISQ*1707030091875*2b0a40ebda16e5bee3308b325ebb4245d782a14b32e770b2b87d45870ae134a5*_x_Hli6JwIZc8mlnjF8g1LVa5wn0rABy5gKk02rYdyU"

        };



    messaging.send(payload)
    .then((result) => {
        console.log(result)
    })