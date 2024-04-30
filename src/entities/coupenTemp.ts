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
import { Vehicle } from "./vehicles";
 
  const ownerFilter = ({ session, context, listKey, operation }) => {
    if (session?.data?.role === "admin"||session?.data?.role === "staff" ) {
      return true;
    }
  }
    export const Coupen = list({
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
      
            hideCreate: isNotAdmin,
            listView: {
              initialColumns: [
             
         
              
                "coupenNumber",
                "createdAt",
              ],
              initialSort: { field: "createdAt", direction: "DESC" },
            },
          },
        
          fields: {
            
        
          paymentDetail: relationship({
            ref: "Payment.coupenDetail",
            many: false,
        }),
            
          
             coupenNumber:text({isIndexed:"unique" }),
         
      
          userDetail:relationship({
            ref:'User.coupenDetail',
            many:false
          }),
          vehicleDetail:relationship({
            ref:'Vehicle.coupenDetail',
            many:false
          }),
          bidDetail:relationship({
            ref:"Bid.coupenDetail",
            many:false
          }),
          coupenStatus:select({
            type: "enum",
            options: [
              { label: "Unclaimed", value: "unclaimed" },
            
              { label: "Applied", value: "applied" },
            ],
            defaultValue: "unclaimed",
          }),
       
            
            
            createdAt: timestamp({ ...fieldOptions, defaultValue: { kind: "now" } }),
            updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
          },


          hooks: {
            resolveInput: async ({ resolvedData, context, operation }) => {
              if (operation !== "create") {
                return resolvedData;
              }
              console.log("res",resolvedData,"con", context,"op", operation)
              // const { user } = await context.query.Payment.findOne({
              //   where: { id: resolvedData.payment.connect.id },
              //   query: `user { id }`,
              // });
              // return {
              //   ...resolvedData,
              //   user: {
              //     connect: {
              //       id: user.id,
              //     },
              //   },
              //   createdBy: {
              //     connect: {
              //       id: context?.session?.itemId,
              //     },
              //   },
              // };
            },
            afterOperation: async ({ resolvedData, context, operation }) => {
              if (operation !== "create") {
                return;
              }
              console.log("res",resolvedData,"con", context,"op", operation)
            //   await context.prisma.user.update({
            //     where: {
            //       id: resolvedData?.user?.connect?.id,
            //     },
            //     data: {
            //       vehicleBuyingLimit: {
            //         increment: resolvedData?.vehicleBuyingLimitIncrement ?? 0,
            //       },
            //       specialVehicleBuyingLimit: {
            //         increment: resolvedData?.specialVehicleBuyingLimitIncrement ?? 0,
            //       },
            //     },
            //   });  
            // }
            }
          }
    })

  