import { graphql } from "@keystone-6/core";
import { virtual } from "@keystone-6/core/fields";
import path from 'path';
import { DateConvert } from "./dateConvertion";

function resolveViewPath(viewPath) {
  return path.join(path.dirname(__dirname),'src/lib', viewPath);
}
export const excelReportEDownload = virtual({
  field: graphql.field({
    type: graphql.JSON,
    async resolve(item: any, args, context) {
      const event = await context.query.Event.findOne({
        where: { id: item.id },
        query: `eventNo
        seller {
          name
        }
        eventType {
          name
        }
        eventCategory
        location {
          name
        }
        vehicles {
          id
          vehicleIndexNo
          loanAgreementNo
          clientContactPerson
          vehicleCondition
          make
          varient
          rcStatus
          registrationNumber
          yearOfManufacture
          mileage
          insuranceStatus
          yardLocation
          bidStartTime
          bidTimeExpire
          reservePrice
          startPrice
          repoDt
          state
        }`,
      });
     
      const rankLists = await Promise.all(
        event?.vehicles?.map((vehicle) => context.prisma.bid.findMany({
            distinct: ["userId"],
            where: { bidVehicle: { id: { equals: vehicle.id } } },
            orderBy: [
              {
                amount: "desc",
              },
              {
                createdAt: "asc",
              },
            ],
            skip: 0,
            take: 3,
            select: {
              user: {
                select: {
                  mobile: true,
                  firstName: true,
                  lastName: true,                 
                  email:true
                },
              },
              createdAt:true,
              amount: true,
            },
          })
        )
      );
      
      const vehicleRankReducer = (reducer,rank, i) => {
        if (i === 0)
          return {
            ...reducer,
           

            // ---------Shibu
            "BID_TIME":DateConvert(rank?.createdAt),
            "WINNING_BID_AMOUNT *":rank?.amount,
            "WINNER_NAME *": rank.user?.firstName + " " + rank.user?.lastName,
            "WINNER_PRIMARY_PHONE_NUMBER *":rank.user?.mobile,
            "WINNER_EMAIL_ID":rank?.user?.email,
           
            // -------------------------
          };
        if(i===1)
        return {
          ...reducer,
          "BID_TIME":DateConvert(rank?.createdAt),
          "RUNNER_UP_1_BID_AMOUNT":rank?.amount,
            "RUNNER_UP_1_NAME": rank.user?.firstName + " " + rank.user?.lastName,
            "RUNNER_UP_1_MOBILE NO":rank.user?.mobile,
            "RUNNER_UP_1_EMAIL_ID":rank?.user?.email,
        };
        if(i===2)
        return {
          ...reducer,
          "BID_TIME":DateConvert(rank?.createdAt),
          "RUNNER_UP_2_BID_AMOUNT":rank?.amount,
          "RUNNER_UP_2_NAME": rank.user?.firstName + " " + rank.user?.lastName,
          "RUNNER_UP_2_MOBILE NO":rank.user?.mobile,
          "RUNNER_UP_2_EMAIL_ID":rank?.user?.email,
        };
       
      };
      return event.vehicles?.map((vehicle, i) => ({
        "S No": i+1,
   

        //  -----------Shibu
         "EVENT ID CLIENT NAME":`${event?.eventNo} - ${event?.seller?.name}`,
         "LISTING ID":vehicle?.vehicleIndexNo,
         "Loan Agreement No *": vehicle?.loanAgreementNo,
         "MAKE":vehicle?.make,
         "VARIANT":vehicle?.varient,
         "RC_NO":vehicle?.registrationNumber,
         "ENGINE NUMBER":vehicle?.engineNo,
         "CHASSIS_NO":vehicle?.chassisNo,
         "YEAR_OF_MANUFACTURE":vehicle?.yearOfManufacture,
         "YARD LOCATION":vehicle?.yardLocation,
         "AUCTION_START_DATE":DateConvert(vehicle?.bidStartTime),
         "AUCTION_END_DATE_IST":DateConvert(vehicle?.bidTimeExpire),
         "AUCTION_LOCATION":event?.location?.name,
         "AUCTION_TYPE":event?.eventCategory,
         "Auctioneer":'AUTOBSE',
        //  ---------

        // ...vehicle,

        ...rankLists[i]?.reduce(vehicleRankReducer, {})
      }));
      // console.log(context?.session?.itemId);
    },
  }),
  ui: {
    views: resolveViewPath("./report-field-view.tsx"),
  },
});
