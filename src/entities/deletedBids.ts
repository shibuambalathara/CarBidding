import {
    integer,
    relationship,
    text,
    timestamp,
  } from "@keystone-6/core/fields";
  import { list } from "@keystone-6/core";
  import {
    fieldOptions,
    isAdminCreate,
    isAdminEdit,
    isSignedIn,
    isSuperAdmin,
  } from "../application/access";
  
  const ownerFilter = ({ session, context, listKey, operation }) => {
    if (session?.data?.role === "admin") {
      return true;
    }
}
export const DeletedBid = list({
    access: {
      operation: {
        query: isSuperAdmin,
        create: isSuperAdmin,
        update: isSuperAdmin,
        delete: () => false,
      },
      filter: {
        query: ownerFilter,
      },
    },
    fields: {
        name: text({
          ui: {
            createView: { fieldMode: "hidden" },
            itemView: { fieldMode: "read" },
          },
        }),
        deletedBidDetail:relationship({
            ref:"Bid.deletedBid",
            many:true
        }),
    
        amount: integer({}),
        user: relationship({
          ref: "User.deletedBid",
          many: false,
          ui: {
            createView: { fieldMode: isAdminCreate },
            itemView: { fieldMode: isAdminEdit },
          },
        }),
    
        deletedbidVehicle: relationship({
          ref: "Vehicle.deletedBid",
          many: false,
        }),
       
     
        createdAt: timestamp({
          ...fieldOptions,
          defaultValue: { kind: "now" },
        }),
        updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
      },
})