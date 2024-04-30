import { 
    image,
    password,
    relationship,
    select,
    text,
    timestamp,
    integer,
} from "@keystone-6/core/fields";
import {
    fieldOptions,
    isAdminCreate,
    isAdminEdit,
    isNotAdmin,
  } from "../application/access";

import { list } from "@keystone-6/core";
const ownerFilter = ({ session, context, listKey, operation }) => {
    if (session?.data?.role === "admin") {
      return true;
    }
  }

export const ContactUs = list({
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
            "firstName",
          
          ],
          initialSort: { field: "createdAt", direction: "DESC" },
        },
      },
    fields: {
        firstName: text({}),
        lastName:text(),
        mobile:text(),
        state:text(),
        subject:text(),
       
        message :text(),
        status:select({
            type: "enum",
            options: [
              { label: "Created", value: "created" },
            
              { label: "Solved", value: "solved" },
            ],
            defaultValue: "created",
          }),
       
        createdAt: timestamp({ ...fieldOptions, defaultValue: { kind: "now" } }),
        updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),

    },
});
