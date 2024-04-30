import {
    checkbox,
    file,
    integer,
    relationship,
    select,
    text,
    timestamp,
  } from "@keystone-6/core/fields";
  import { list } from "@keystone-6/core";
  import { excelReportEDownload } from "../lib/report-field";


 export const Notification = list({
    access: {
      operation: {
        query: () => true,
        create: () => true,
        update: ({ session }) => false,
        delete: ({ session }) => true,
      },
      filter: {},  
    },
 
    fields: {
  
deviceToken:text(),
eventId:text(), 
user:relationship({
  ref:"User.notification",
  many:false
}),


    },
   
  });