const { Client } = require('pg');
import * as admin from 'firebase-admin';
 import { initializeApp } from 'firebase-admin/app';
 const serviceAccount = require('../../lib/autobse-push-notification-firebase-adminsdk-zdmde-3fb12d5d57.json');


   
    
    // Define a function to send notifications


export const Notifications = async () => {
  console.log("reached at notification");

  try {
    // Create a connection to the database
    const client = new Client({
      connectionString: 'postgresql://postgres:123@localhost:5432/automax1',
    });

    await client.connect();
    console.log('Connected to the database successfully');

    // Define the SQL query
    const vehicleQuery = `SELECT "registrationNumber","bidTimeExpire",event from "Vehicle" where "bidTimeExpire" > now()`;
    const worksheetQuery = `SELECT "registrationNumber","userDetail" from "WorkSheet"`; 

    // Execute the SQL query
    const { rows: vehicle } = await client.query(vehicleQuery);
    const { rows: worksheetData } = await client.query(worksheetQuery);
    console.log("vehicles", vehicle, "work", worksheetData);

    const matchedVehicles = worksheetData.filter(vehicleObj => vehicle.some(worksheetObj => worksheetObj.registrationNumber === vehicleObj.registrationNumber));

    console.log("matchedVehicles", matchedVehicles);

    for (const element of matchedVehicles) {
      try {
        // const notificationQuery = 'SELECT "deviceToken" FROM "Notification" WHERE "user" = $1';


        const notificationQuery1=`        SELECT n.id AS notification_id, n."deviceToken", n."user" AS notification_user,
        w.id AS worksheet_id, w."registrationNumber", w.make, w.model, w.chassis, w."engineNo",
        w."vehicleCondition", w.image1, w.image2, w.image3, w.image4, w.image5,
        w."voiceRecordUrl", w."videoUrl", w.varient, w."userDetail", w."createdAt", w."updatedAt"
 FROM public."Notification" n
 JOIN public."WorkSheet" w ON n."user" = w."userDetail"
 WHERE n."user" = $1 AND w."userDetail" = $1`;
 
        const userId = element.userDetail;

        const { rows: NotificationData } = await client.query(notificationQuery1, [userId]);  
        console.log("NotificationData", NotificationData);
        // await sendNotification(deviceToken);
        NotificationData.map(async(notification:any)=>{return(
          console.log("device token",notification?.deviceToken),
          await sendNotification(notification?.deviceToken) 
          

        )   
        })

      } catch (error) {
        console.error('Error executing query:', error.message);
        // Log the full error stack trace
        console.error(error); 
      }
    }

    // Close the connection after all operations are done
    await client.end();

  } catch (error) {
    console.error('Error executing SQL query:', error); 
    // Handle the error as needed
    throw error; 
  } 
};


const sendNotification = async (deviceToken: any) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)  ,     
        projectId: 'autobse-push-notification',
    });
  }

  const messaging = admin.messaging();
  try {
    const payload = {
      notification: {
        title: "This is a Notification",
        body: "This is the body of the notification message."
      },
      token: "12345678911111234567891111123456789111112345678911111234567891111123456789111112345678911111234567891111123456789111112345678911111234567891111123456789",
    };

    const result = await messaging.send(payload);
    console.log("Notification sent successfully:", result);
  } catch (error) {
    console.error('Error sending notification:', error);
    console.error('Error details:', error.errorInfo);
  }
};

