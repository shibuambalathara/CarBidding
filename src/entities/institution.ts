import {
    relationship,
    text,
    timestamp,
  } from "@keystone-6/core/fields";
  import { list } from "@keystone-6/core";
  import { fieldOptions, isNotAdmin, isStaff, isSuperAdmin } from "../application/access";
  
  export const Institution = list({
    access: {
      operation: {
        query: () => true,
        create: (...rest)=>isSuperAdmin(...rest) || isStaff(...rest),
        update: (...rest)=>isSuperAdmin(...rest) || isStaff(...rest),
        delete: isSuperAdmin,
      },
    },
    ui: {
      isHidden: isNotAdmin,
    },
    fields: {
      name: text({
        validation: {
          isRequired: true,
        },
      }),
   
    
  
  
 
      
      findAuction_details: relationship({
        ref: "FindAuction.institution_details",
        many: true,
        ui: {
          createView: { fieldMode: "hidden" },
          itemView: { fieldMode: "read" },
        },
      }),
  
   
  
      createdAt: timestamp({
        ...fieldOptions,
        defaultValue: { kind: "now" },
      }),
      updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
    },
  });