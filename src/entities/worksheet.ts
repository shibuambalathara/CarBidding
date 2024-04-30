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

  return { userDetail: { id: { equals: session?.itemId } } };
};
  export const WorkSheet=list({

    access: {
        operation: {
          query: ({ session }) => !!session?.itemId,
          // create: ({ session }) => !!session?.itemId,
          create: ( {session }) => !!session?.itemId,
           update: ({ session }) => !!session?.itemId,
          
          delete: ({ session }) => !!session?.itemId,
        },
        filter: {
          query: ownerFilter,
          update: ownerFilter,
    
        },
      },
     
   

      fields: {
        registrationNumber: text({validation:{isRequired:true}}),
        make:text(),
        model:text(),
        chassis:text(),
        engineNo:text(),
        vehicleCondition:text(),
        image1:text(),
        image2:text(),
        image3:text(),
        image4:text(),
        image5:text(),
        voiceRecordUrl:text(),
        videoUrl:text(),
        varient:text(),
         
   userDetail:relationship({
  ref:"User.workSheetDetail",
  many:false
}),

        createdAt: timestamp({ ...fieldOptions, defaultValue: { kind: "now" } }),
        updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),

    },
  })
  