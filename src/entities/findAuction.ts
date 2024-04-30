import {
    checkbox,
    file,
    integer,
    bigInt,
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
    isSuperAdmin,
    isStaff,
    isSignedIn
  } from "../application/access";
  export const FindAuction = list({
    ui: {
      hideCreate: isNotAdmin || isStaff,
      hideDelete: isNotAdmin,
      itemView: { defaultFieldMode: "read" },
      createView: { defaultFieldMode: isAdminCreate },
    

    },
    access: {
        operation: {
          query: () => true,
          create :(...rest)=>isSuperAdmin(...rest) || isStaff(...rest),
          update: (...rest)=>isSuperAdmin(...rest) || isStaff(...rest),
          delete: isSuperAdmin,
        },
      },
      fields: {
        listingId: integer({
          isIndexed: true,
          defaultValue: {
            kind: "autoincrement",
          },
          db: {
            isNullable: false,
          },

        }),
        
        
        emdAmount:bigInt(),
        city:text(),
        reservePrice:bigInt(),
        emdSubmissionDate:timestamp(),
        auctionStartDate:timestamp(),
        auctionEndDate:timestamp(),
        contactDetails:text(),
        address:text(),
        auctionNotice:text(),
        vehicleRegNo:text(),
        vehicleModel:text(),
        image:text(),
        tenderDocument:text(),
        state:relationship({
          ref:"State.find_auction_state",
          many:false
        }),
        institution_details: relationship({
            ref: "Institution.findAuction_details",
            many: false,
            ui: {
                itemView: { fieldMode: isAdminEdit },
              },
          }),
        propertyType: select({
            type: "enum",
            options: [
              { label: "Flat", value: "flat" },
              { label: "Vehicle", value: "vehicle" },
              { label: "Mechinery", value: "mechinery" },
              { label: "Gold", value: "gold" },
              { label: "Other", value: "other" },
             
            ],
            defaultValue: "vehicle",
            ui: {
              displayMode: "segmented-control",
              itemView: { fieldMode: isAdminEdit },
            },
          }),
          createdAt: timestamp({
            ...fieldOptions,
            defaultValue: { kind: "now" },
          }),
          updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
        },
    
        
})