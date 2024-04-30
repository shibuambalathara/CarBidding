import {
    float,
    integer,
    relationship,
    select,
    text,
    timestamp,
  } from "@keystone-6/core/fields";
  import { list } from "@keystone-6/core";
  import {
    fieldOptions,
    isAdminCreate,
    isAdminEdit,
    isNotAdmin,
    isSignedIn,
    isSuperAdmin,
    isStaff
  } from "../application/access";
  import { bidRank } from "../lib/bid-rank.field";
  import { vehicleEventStatus } from "../lib/vehicle-event-status.field";
  import { totalBids } from "../lib/total-bids.field";
  
  
  const ownerFilter = ({ session, context, listKey, operation }) => {
    if (session?.data?.status === "active") {
      return true;
    }
    return false;
  };
  // create operation updated by shibu
  export const SellACar = list({
    access: {
      operation: {
        query: () => true,
        create: () => true,
        update: isSuperAdmin,
        delete: isSuperAdmin,
      },
      filter: {
        query: ownerFilter,
      },
    },
   
    ui: {
      labelField: "registrationNumber",
      hideCreate: isNotAdmin,
      hideDelete: isNotAdmin,
      itemView: { defaultFieldMode: isAdminEdit },
      createView: { defaultFieldMode: isAdminCreate },
    },
    fields: {
      vehicleIndexNo: integer({
        isIndexed: true,
        defaultValue: {
          kind: "autoincrement",
        },
        db: {
          isNullable: false,
        },
        ui: {
          createView: { fieldMode: "hidden" },
          itemView: { fieldMode: "read" },
          listView: { fieldMode: "read" },
        },
      }),
      registrationNumber: text({
        validation: {
          isRequired: true,
        },
        isIndexed: true,
      }),
        
       
     

      user: relationship({
        ref: "User.sellACar",
        many: false,
     
      }),
    
  
    
       make: text(),
       model: text(),
       varient: text(),
   
       fuel: text(),
   
       yearOfManufacture: integer({}),
   
       kmRead: text({}),
     
       veicleLocation: text(),
   
       engineNo: text({}),
   
       interiorImages: text(),
       exteriorImages: text(),
                                
       vehicleCondition: text(),
   
       state: text(),
   
       address: text(),
    
    
        landmark: text(),
       pincode: text(),
      //  clientContactPerson: text(),
      //  clientContactNo: text(),
       rtoCode: text(),
     body:text(),
     expectToSell:timestamp({
      defaultValue: { kind: "now" },
     }),
       createdAt: timestamp({
        ...fieldOptions,
        defaultValue: { kind: "now" },
      }),
      updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
    },
  
  });
  