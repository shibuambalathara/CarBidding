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
  export const SelectedVehicle = list({
    access: {
      operation: {
        query: isSignedIn,
        create: (...rest)=>isSuperAdmin(...rest) || isStaff(...rest),
        update: isSignedIn,
        delete: isSuperAdmin,
      },
      filter: {
        query: ownerFilter,
      },
    },
    fields:{
        vehicleIds:text()
    }
})