import {
  integer,
  relationship,
  select,
  timestamp,
  text,
  image,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions, isAdminEdit,isAdminCreate } from "../application/access";

const ownerFilter = ({ session, context, listKey, operation }) => {

  if (session?.data?.role === "admin") {
  
    return true;
  }
  return { user: { id: { equals: session?.itemId } } };
};

export const Payment = list({
  access: {
    operation: {
      query: ({ session }) => !!session?.itemId,
      // create: ({ session }) => !!session?.itemId,
      create: () => true,
       update: ({ session }) => !!session?.itemId,
      
      delete: ({ session }) => !!session?.itemId,
    },
    filter: {
      query: ownerFilter,
      update: ownerFilter,
    },
  },
  hooks: {
    resolveInput: ({ resolvedData, context,item, operation }) => {
    
      if (operation !== "create") {
       
        return resolvedData;
      }

      return {
        
        ...resolvedData,
  
        user: {
          connect: {
            //  id: context?.session?.itemId,
            id: resolvedData?.user?.connect?.id ? resolvedData?.user?.connect?.id :context?.session?.itemId
          },
        },
    
        createdBy:{connect:{id:context?.session?.itemId}}
      
      };
      
     
    },
    // expire registration created by shibu
     afterOperation:async({item,operation,context})=>{

       if(item.paymentFor==='registrations' && item.status==='success' && operation==='update' ){
       const createdAtDate = new Date(item.createdAt as string);
       const expireRegistration = new Date(createdAtDate);
         expireRegistration.setFullYear(expireRegistration.getFullYear() + 1);

  const result=       await context.prisma.payment.update({
           where: { id: item.id }, // Use the item's ID to update the specific item
         data: { RegistrationExpire: expireRegistration },
         });
         console.log("result",result)
    }
    if(item.paymentFor==='openBids' && item.status==='success' && operation==='update' ){
      const createdAtDate = new Date(item.createdAt as string);
      const expireRegistration = new Date(createdAtDate);
      expireRegistration.setMonth(expireRegistration.getMonth() + 3)

 const result=       await context.prisma.payment.update({
          where: { id: item.id }, // Use the item's ID to update the specific item
        data: { RegistrationExpire: expireRegistration },
        });
        console.log("result",result)
   }
   },
   
  
  },

  ui: {
    createView: { defaultFieldMode: "edit" },
    itemView: { defaultFieldMode: isAdminEdit },
    labelField: "refNo",
  },

  fields: {
    refNo: integer({
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
    amount: integer({
      defaultValue: 10000,
    }),
   
    paymentFor: select({
      validation: {
        isRequired: true,
      },
      options: [
        { value: "registrations", label: "Registrations" },
        { value: "emd", label: "EMD" },
        { value: "refund", label: "Refund" },
        {value:"openBids",label:"Open Bids"},
        { value: "other", label: "Other" },
      ],
    }),
    description: text(),
    status: select({
      defaultValue: "pending",
      options: [
        { value: "pending", label: "Pending" },
        { value: "success", label: "Success" },
        { value: "failed", label: "Failed" },
      ],
    }),
    user: relationship({
      ref: "User.payments",
      many: false,
   
    }),

    image: image({ storage: "my_s3_images" }),
    emdUpdate: relationship({
      ref: "EmdUpdate.payment",
      many: true,
      ui: {
        listView: {
          fieldMode: "read",
        },
        itemView: {
          fieldMode: isAdminEdit,
        },
        createView: {
          fieldMode: "hidden",
        },
      },
    }),
    coupenDetail: relationship({
      ref: "Coupen.paymentDetail",
      many: true,
  }),
     
    createdAt: timestamp({
      ...fieldOptions,
      defaultValue: { kind: "now" },
    }),
    createdBy: relationship({
      ref: "User.paymentByAdmin",
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
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
    RegistrationExpire:timestamp()
  },
});
