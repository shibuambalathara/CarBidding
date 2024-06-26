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
  return {
    user: {
      id: { equals: session?.itemId },
    },
  };
};

export const Bid = list({
  access: {
    operation: {
      query: isSignedIn,
      create: isSignedIn,
      update: isSuperAdmin,
      delete: isSuperAdmin,
    },
    filter: {
      query: ownerFilter,
    },
  },
  hooks: {
    validateInput: async ({ resolvedData, context, addValidationError }) => {
      try {
        console.log("res",resolvedData)
        const { amount } = resolvedData;
        const userId =
          context?.session?.data?.role === "admin" && !! resolvedData?.user?.connect?.id
            ? resolvedData.user.connect.id
            : context?.session?.itemId;
        const [bidVehicle, bidCount, user, myBidMaxAmount] = await Promise.all([
          context.query.Vehicle.findOne({
            where: { id: resolvedData?.bidVehicle?.connect?.id },
            query: `id currentBidAmount startBidAmount bidTimeExpire currentBidUser { id } event { startDate eventCategory status noOfBids seller { id name } isSpecialEvent bidLock location { state { name } } }`,
          }),         
          context.query.Bid.count({
            where: {
              bidVehicle: {
                id: { equals: resolvedData?.bidVehicle?.connect?.id },
              },
              user: { id: { equals: userId } },
            },
          }),
          context.query.User.findOne({
            where: { id: userId },
            query: `status currentVehicleBuyingLimit { vehicleBuyingLimit specialVehicleBuyingLimit } states { id name } bannedSellers { id }  payments { RegistrationExpire status}`,
          }),
          context.prisma.bid.findFirst({
            where: {
              bidVehicle: {
                id: { equals: resolvedData?.bidVehicle?.connect?.id },
              },
              user: { id: { equals: userId } },
            },
            orderBy: {
              amount: "desc",
            },
          }),
        ]);
        //  ------------------------
      const result=  user?.payments?.find((payment)=>{return(payment?.status=='success' && (new Date( payment?.RegistrationExpire) > new Date()))})
        // -----------------------
       if(!result){
        addValidationError("Please Check Registration Payments")
       }
        if (!bidVehicle) {
          addValidationError("vehicle not found");
        }
        if (new Date(bidVehicle.bidTimeExpire) < new Date() && bidVehicle?.event?.eventCategory!='stock') {
          addValidationError("Auction has ended");
        }
        if (new Date(bidVehicle.event.startDate) > new Date() && bidVehicle?.event?.eventCategory!='stock') {
          addValidationError("Auction yet to start");
        }
        if (bidVehicle.event.status !== "active") {
          addValidationError("Auction not active");
        }
        if (bidCount >= bidVehicle.event.noOfBids && bidVehicle?.event?.eventCategory!='stock') {
          addValidationError("No Bids Left");
        }
        if (bidVehicle?.event?.eventCategory!='stock' && (
          !user?.states
            ?.map((s: { name: string }) => s?.name)
            ?.includes(bidVehicle?.event?.location?.state?.name) 
         ) ) {
          addValidationError(
            "You are not allowed to bid on this vehicle in the state: " +
              bidVehicle?.event?.location?.state?.name
          );
        }
        if (Number(bidVehicle.startBidAmount) > amount) {
    
          addValidationError(
            "Bid Amount smaller than start bid amount, Start Bid Amount: " +
              bidVehicle.startBidAmount
          );
        }
        if (
          user?.bannedSellers?.some((s) => s?.id === bidVehicle?.seller?.id)
        ) {
          addValidationError(
            "You are banned from bidding on this vehicle seller: " +
              bidVehicle?.seller?.name
          );
        }
        if (myBidMaxAmount && myBidMaxAmount?.amount >= amount) {
          addValidationError(
            "Bid Amount smaller than your previous bid amount: " +
              myBidMaxAmount?.amount
          );
        }
        
        if (
          bidVehicle.event.bidLock === "locked" &&
          bidVehicle.currentBidAmount >= amount
        ) {
          addValidationError(
            "Bid Amount smaller than current bid amount, Current Bid Amount: " +
              bidVehicle.currentBidAmount
          );
        }
        if (
          bidVehicle.currentBidUser?.id !== userId &&
          bidVehicle.event.isSpecialEvent &&
          user?.currentVehicleBuyingLimit?.specialVehicleBuyingLimit <= 0
        ) {
          addValidationError("Insufficient Buying Limit for Special Event");
        }
        if (
          bidVehicle.currentBidUser?.id !== userId &&
          !bidVehicle.event.isSpecialEvent &&
          user?.currentVehicleBuyingLimit?.vehicleBuyingLimit <= 0
        ) {
          addValidationError("Insufficient Buying Limit");
        }
      } catch (e) {
        console.log("e: ", e);
        addValidationError(e.message);
      }
    },
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation !== "create") {
        console.log("resolve data",resolvedData)
        return resolvedData;
      }
      const [bidVehicle, user] = await Promise.all([
        context.query.Vehicle.findOne({
          where: { id: resolvedData?.bidVehicle?.connect?.id },
          query: ` registrationNumber `,
        }),
        context.query.User.findOne({
          where: {
            id: resolvedData?.user?.connect?.id ?? context?.session?.itemId,
          },
          query: ` username `,
        }),
      ]);
      resolvedData.name = `${user?.username} : ${bidVehicle?.registrationNumber}`;
      if (context?.session?.data?.role !== "admin" || ! resolvedData?.user?.connect?.id) {
        resolvedData.user = { connect: { id: context?.session?.itemId } };
      }
      return resolvedData;
    },
    afterOperation: async ({
      listKey,
      operation,
      inputData,
      originalItem,
      item,
      resolvedData,
      context,
    }) => {
      if (operation === "delete") {
        /**
         * Note: We could'nt update the expire time on delete
         * replace the current bid user and amount with the
         * previous bid user and amount
         */
        const bid = await context.prisma.bid.findFirst({
          where: {
            user: {
              status: { equals: "active" },
            },
            bidVehicle: {
              id: { equals: originalItem?.bidVehicleId },
            },
          },
          select: {
            id: true,
            userId: true,
            amount: true,
          },
          orderBy: { amount: "desc" },
        });

        const userConnection = bid?.userId
          ? {
              connect: {
                id: bid?.userId,
              },
            }
          : {
              disconnect: true,
            };
        await context.prisma.vehicle.update({
          where: { id: originalItem?.bidVehicleId },
          data: {
            currentBidAmount: bid?.amount ?? 0,
            currentBidUser: userConnection,
          },
        });
      }
      if (operation === "create") {
        /**
         * 1. if the bid is higher than the current bid amount then
         *   i .Update the current bid amount for the vehicle
         *   ii. Update the bid time expire for the vehicle if
         *    expire time with in given minutes
         *   iii. Update the current bid User for the vehicle
         */
        const bidVehicle = await context.query.Vehicle.findOne({
          where: { id: resolvedData?.bidVehicle?.connect?.id },
          query: `bidTimeExpire id currentBidAmount event { id extraTime isSpecialEvent extraTimeTrigerIn eventCategory } `,
        });
      

        if (bidVehicle.currentBidAmount < resolvedData.amount) {
         
          const durationInMinutes = (bidVehicle?.event?.extraTimeTrigerIn ?? 2) * 60000; // 2 minutes
          
          const addBidTime = (bidVehicle?.event?.extraTime ?? 2) * 60000; // 2 minutes
          const bidTimeExpire =
            (new Date(bidVehicle.bidTimeExpire).getTime() - durationInMinutes <=
              new Date().getTime() && bidVehicle.event.eventCategory !== "open")
              ? new Date(
                  new Date(bidVehicle.bidTimeExpire).getTime() + addBidTime
                )
              : new Date(bidVehicle.bidTimeExpire);
        
          await context.prisma.vehicle.update({
            where: { id: resolvedData?.bidVehicle?.connect?.id },
            data: {
              currentBidAmount: resolvedData?.amount,
              bidTimeExpire: bidTimeExpire,
              currentBidUser: {
                connect: { id: resolvedData?.user?.connect?.id },
              },
            },
          });

         

          // update event end time on online auction by shibu..............
          if( bidVehicle.event.eventCategory !== "open"){
            
          const event_Id=`${bidVehicle.event.id}`
          const lastVehicleBidTimeExpire = await context.prisma.vehicle.findFirst({
            where: { event: { id: event_Id } },
            orderBy: { bidTimeExpire: "desc" },
            select: {
              id: true,
              bidTimeExpire:true
            }
          });
        
          await context.query.Event.updateOne({
            where: { id: event_Id },
            data: {
              endDate: lastVehicleBidTimeExpire.bidTimeExpire
            }
          });
          }
        //  ........
        const eventId = `'${bidVehicle.event.id}'`;
          if(new Date(bidVehicle.bidTimeExpire).getTime() - durationInMinutes <=
          new Date().getTime() && bidVehicle.event.eventCategory === "open"){
          
            const result = await Promise.all([
              context.prisma.$executeRawUnsafe(`UPDATE "Vehicle" set "bidTimeExpire" = "bidTimeExpire" + ${bidVehicle?.event?.extraTime} * INTERVAL '1 MINUTE', "bidStartTime" = "bidStartTime" + ${bidVehicle?.event?.extraTime} * INTERVAL '1 MINUTE' WHERE event = ${eventId} AND "bidStartTime" >  NOW() AT TIME ZONE 'UTC'`),
              context.prisma.$executeRawUnsafe(`UPDATE "Vehicle" set "bidTimeExpire" = "bidTimeExpire" + ${bidVehicle?.event?.extraTime} * INTERVAL '1 MINUTE' WHERE "event" = ${eventId} AND "bidTimeExpire" >NOW() AT TIME ZONE 'UTC' AND "bidStartTime" < NOW() AT TIME ZONE 'UTC'`),
              context.prisma.$executeRawUnsafe(`UPDATE "Event" set "endDate" = "endDate" + ${bidVehicle?.event?.extraTime} * INTERVAL '1 MINUTE' WHERE id = ${eventId}`)
            ])
                        
          
          
          }
        
          
        }
      }
    },
  },
  fields: {
    name: text({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),

    amount: integer({}),
    user: relationship({
      ref: "User.quotedBids",
      many: false,
      ui: {
        createView: { fieldMode: isAdminCreate },
        itemView: { fieldMode: isAdminEdit },
      },
    }),

    bidVehicle: relationship({
      ref: "Vehicle.userVehicleBids",
      many: false,
    }),
    // created by shibu...
    coupenDetail:relationship({
      ref:"Coupen.bidDetail",
      many:true
    }),

    deletedBid:relationship({
      ref:"DeletedBid.deletedBidDetail",
      many:true
    }),
    createdAt: timestamp({
      ...fieldOptions,
      defaultValue: { kind: "now" },
    }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },

});
