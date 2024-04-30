import {
  image,
  password,
  relationship,
  select,
  text,
  timestamp,
  integer,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import {
  fieldOptions,
  isAdminCreate,
  isAdminEdit,
  isNotAdmin,
} from "../application/access";
import { vehicleBuyingLimitField } from "../lib/vehicle-buying-limit.field";


const ownerFilter = ({ session, context, listKey, operation }) => {
  if (session?.data?.role === "admin" ) {
 
    return true;
  }
  // ownfilter add staff  by shibu
  if (session?.data?.role === "staff" && operation === "query") {
    // return true;
   
    return { state: { equals: session?.data?.state } };
  }
  return { id: { equals: session?.itemId } };

};

export const User = list({
  access: {
    operation: {
     
      query: ({ session }) => !!session,
      create: () => true, //!session?.itemId || isSuperAdmin({ session }),
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session,
    },
    filter: {
      query: ownerFilter,
      update: ownerFilter,
      delete: ownerFilter,
    },
  },
  ui: {
    labelField: "username",
    hideCreate: isNotAdmin,
    listView: {
      initialColumns: [
        "mobile",
        "dealerId",
        "status",
        "firstName",
        "lastName",
        "email",
        "createdAt",
      ],
      initialSort: { field: "createdAt", direction: "DESC" },
    },
  },
  fields: {
    idNo: integer({
      isIndexed:"unique",
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
    dealerId: text({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        listView: { fieldMode: "read" },
      },
    }),
    firstName: text({
      
    }),
    lastName: text({}),
    email: text({
      // Indexed: "unique",
      access: {
        read: () => true,
      },
    }),
    username: text({
      isIndexed: "unique",
    }),
    phone: text({}),
    businessName: text({}),
    category: relationship({
      ref: "EventType.users",
      many: true,
    }),
    mobile: text({
      isIndexed: "unique",
      validation: {
        isRequired: true,
      },
      ui: {
        createView: { fieldMode: isAdminCreate },
        itemView: { fieldMode: isAdminEdit },
      },
    }),
    password: password({
      // validation: {
      //   isRequired: true,
      // },
    }),
    currentVehicleBuyingLimit: vehicleBuyingLimitField,
    vehicleBuyingLimit: integer({
      defaultValue: 0,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
        listView: { fieldMode: "hidden" },
      },
    }),
    specialVehicleBuyingLimit: integer({
      defaultValue: 0,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
        listView: { fieldMode: "hidden" },
      },
    }),
    image: image({ storage: 'local_images' }),
    pancard: image({ storage: "local_images" }),
    pancardNo: text({}),
    idProof: image({ storage: "local_images" }),
    idProofBack: image({ storage: "local_images" }),
    idProofType: select({
      type: "enum",
      options: [
        { label: "Aadhar", value: "aadhar" },
        { label: "Driving License", value: "drivingLicense" },
        { label: "Passport", value: "passport" },
      ],
    }),
    idProofNo: text({}),
    dealership: image({ storage: "local_images" }),
    country: text({}),
    city: text({}),
    role: select({
      type: "enum",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Staff", value: "staff" },
        { label: "Seller", value: "seller" },
        { label: "Dealer", value: "dealer" },
        // { label: "Equitas_Bank_staff", value: "Equitas_Bank_staff" }
      ],
      defaultValue: "dealer",
      ui: {
        displayMode: "segmented-control",
        createView: { fieldMode: isAdminCreate },
        itemView: { fieldMode: isAdminEdit },
      },
      access: {
        update: ({ session }) => session?.data?.role === "admin",
      },
    }),
    watchList: relationship({
      ref: "Vehicle.watchedBy",
      many: true,
    }),
    emdUpdates: relationship({
      ref: "EmdUpdate.user",
      many: true,
      ui: {
        listView: {
          fieldMode: "read",
        },
        itemView: {
          fieldMode: "read",
        },
        createView: {
          fieldMode: "hidden",
        },
      },
    }),
    payments: relationship({
      ref: "Payment.user",
      many: true,
      ui: {
        listView: {
          fieldMode: "read",
        },
        itemView: {
          fieldMode: "read",
        },
        createView: {
          fieldMode: "hidden",
        },
      },
    }),

    emdUpdatesByAdmin: relationship({
      ref: "EmdUpdate.createdBy",
      many: true,
      ui: {
        listView: {
          fieldMode: "read",
        },
        itemView: {
          fieldMode: "read",
        },
        createView: {
          fieldMode: "hidden",
        },
      },
    }),
    paymentByAdmin: relationship({
      ref: "Payment.createdBy",
      many: false,
      ui: {
        listView: {
          fieldMode: "read",
        },
        itemView: {
          fieldMode: "read",
        },
        createView: {
          fieldMode: "hidden",
        },
      },
    }),
    status: select({
      type: "enum",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Blocked", value: "blocked" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      defaultValue: "pending",
      ui: {
        displayMode: "segmented-control",
        createView: { fieldMode: isAdminCreate },
        itemView: { fieldMode: isAdminEdit },
      },
    }),
    state: text({
      // access: {
      //   update: ({ session }) => session?.data?.role === "admin",
      // },
    }),
    states: relationship({
      ref: "State.users",
      many: true,
    
    }),
    activeBids: relationship({
      ref: "Vehicle.currentBidUser",
      many: true,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    quotedBids: relationship({
      ref: "Bid.user",
      many: true,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    bannedSellers: relationship({
      ref: "Seller.bannedUsers",
      many: true,
    }),
    //created by shibu.....
    coupenDetail:relationship({
      ref:"Coupen.userDetail",
      many:true
    }),
   eventDetail : relationship({
      ref: "Event.participants",
      many:true
     
    }),
       workSheetDetail:relationship({
  ref:"WorkSheet.userDetail",
  many:true
}),

deletedBid:relationship({
  ref:"DeletedBid.user",
  many:true
}),

sellACar: relationship({
  ref: "SellACar.user",
  many: true,

}),
notification:relationship({
  ref:"Notification.user",
  many:true
}),
userCategory:text(),
// // for creating event based on location in stock feature
// userLocation:text(),
tempToken:integer({isIndexed:'unique'}),
    createdAt: timestamp({ ...fieldOptions, defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});
  